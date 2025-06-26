import { useEffect, useRef, useState } from "react";
import { IconNote } from "@tabler/icons-react";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { configDatabase } from "@/entities/configuratorDb";
import { NoteGroupRepository } from "@/repository/Note/NoteGroupRepository";
import { NoteRepository } from "@/repository/Note/NoteRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { generateUUID } from "@/utils/UUIDUtils";

import "github-markdown-css/github-markdown.css";

import MarkdownIt from "markdown-it";
import { notifications } from "@mantine/notifications";
import { AgentMessage, bookAgent } from "@/agents/bookAgent";
import { createBlock, createBlockInstance, saveParamInstance } from "@/agents/bookAgentActions";
import { useApiSettingsStore } from "@/stores/apiSettingsStore/apiSettingsStore";

export const BookAgentChat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const { openRouterModels, currentOpenRouterModel, setCurrentOpenRouterModel } =
    useApiSettingsStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Прокручиваем вниз при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);
    try {
      await bookAgent(question, messages, (msg) =>
        setMessages((prev) => [...prev, { role: "assistant", content: msg }])
      );
    } catch (e: any) {
      notifications.show({ message: e.message ?? "Ошибка" });
    } finally {
      setLoading(false);
    }
  };

  const parseParts = (content: string) => {
    type Part = string | { action: string; title: string; params: any };
    const parts: Part[] = [];

    /** Добавить текст, если он не пустой */
    const pushText = (from: number, to: number) => {
      if (to > from) parts.push(content.slice(from, to));
    };

    let i = 0;
    while (i < content.length) {
      // ближайшее появление [[  или {
      const sq = content.indexOf("[[", i);
      const cu = content.indexOf("{", i);
      const next = sq === -1 ? cu : cu === -1 ? sq : Math.min(sq, cu);

      if (next === -1) {
        pushText(i, content.length);
        break;
      }
      pushText(i, next);

      /* ---- 1. Старый формат [[action|json]] ---- */
      if (content.startsWith("[[", next)) {
        const end = content.indexOf("]]", next);
        if (end === -1) {
          pushText(next, content.length);
          break;
        }

        const body = content.slice(next + 2, end);
        const bar = body.indexOf("|");
        if (bar !== -1) {
          const action = body.slice(0, bar).trim();
          let json: any = {};
          try {
            json = JSON.parse(body.slice(bar + 1));
          } catch {
            /* ignore */
          }
          parts.push({
            action,
            title: json.title ?? action,
            params: json.params ?? json,
          });
        } else {
          pushText(next, end + 2); // кривой тег — вернём в текст
        }
        i = end + 2;
        continue;
      }

      /* ---- 2. Новый формат { action, title, params } ---- */
      if (content[next] === "{") {
        let depth = 0,
          j = next;
        do {
          // баланс скобок, чтобы поймать вложенные { }
          if (content[j] === "{") depth++;
          else if (content[j] === "}") depth--;
          j++;
        } while (j < content.length && depth > 0);

        if (depth === 0) {
          const raw = content.slice(next, j);
          try {
            const obj = JSON.parse(raw);
            if (obj?.action) {
              parts.push({
                action: obj.action,
                title: obj.title ?? obj.action,
                params:
                  obj.params ??
                  (() => {
                    const { action, title, ...rest } = obj;
                    return rest;
                  })(),
              });
              i = j;
              continue;
            }
          } catch {
            /* невалидный JSON — упадёт ниже */
          }
        }
        // не тег: сохранить как обычный текст
        pushText(next, j);
        i = j;
      }
    }

    return parts;
  };

  const { selectedBook } = useBookStore();

  const md = new MarkdownIt();

  const handleCreateNote = async (title: string, content: string) => {
    if (!selectedBook) {
      notifications.show({ message: "Книга не выбрана", color: "orange" });
      return;
    }

    try {
      let group = await NoteGroupRepository.getByTitle(configDatabase, selectedBook.title);

      if (!group) {
        group = await NoteGroupRepository.create(configDatabase, {
          title: selectedBook.title,
          parentUuid: "topLevel",
        });
      }

      if (!group || !group.uuid) {
        throw new Error("Не удалось создать папку для заметок");
      }

      const note = {
        uuid: generateUUID(),
        title: title || content.slice(0, 30) || "Заметка",
        tags: "",
        body: md.render(content),
        noteGroupUuid: group.uuid,
        bookUuid: selectedBook.uuid,
        updatedAt: moment().toISOString(true),
      };

      await NoteRepository.save(configDatabase, note as any);
      notifications.show({ message: "Заметка создана", color: "green" });
    } catch (e: any) {
      notifications.show({
        message: e.message || "Ошибка создания заметки",
        color: "red",
      });
    }
  };

  const handleAction = async (act: string, params: any) => {
    console.log("handleAction", act, params);
    try {
      if (act === "createBlock") {
        await createBlock(params);
        notifications.show({ message: "Блок создан", color: "green" });
      } else if (act === "createBlockInstance") {
        await createBlockInstance(params);
        notifications.show({ message: "Экземпляр создан", color: "green" });
      } else if (act === "saveParamInstance") {
        await saveParamInstance(params);
        notifications.show({ message: "Параметр сохранён", color: "green" });
      }
    } catch (e: any) {
      notifications.show({ message: e.message || "Ошибка", color: "red" });
    }
  };

  return (
    <Box pos="relative" maw={600} mx="auto">
      <Stack>
        {messages.map((m, idx) => (
          <Paper key={idx} shadow="xs" p="sm" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={700}>{m.role === "user" ? "Вы" : "Агент"}</Text>
              {m.role === "assistant" && (
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    setNoteContent(m.content);
                    setNoteTitle(m.content.slice(0, 30) || "Заметка");
                    setNoteModalOpen(true);
                  }}
                  title="Создать заметку"
                >
                  <IconNote size={18} />
                </ActionIcon>
              )}
            </Group>
            {m.role === "assistant" ? (
              <div className="markdown-body">
                {parseParts(m.content).map((p, i) =>
                  typeof p === "string" ? (
                    <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                      {p}
                    </ReactMarkdown>
                  ) : (
                    <Button key={i} mt="xs" onClick={() => handleAction(p.action, p.params)}>
                      {p.title}
                    </Button>
                  )
                )}
              </div>
            ) : (
              <Text>{m.content}</Text>
            )}
          </Paper>
        ))}
        <div ref={messagesEndRef} />
        <Select
          label="Модель OpenRouter"
          placeholder="Выберите модель"
          value={currentOpenRouterModel}
          data={openRouterModels.map((m) => m.modelName)}
          onChange={(v) => setCurrentOpenRouterModel(v || "")}
        />
        <Textarea
          placeholder="Введите сообщение"
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />
        <Button onClick={handleAsk} disabled={loading} loading={loading}>
          Отправить
        </Button>
      </Stack>
      <Modal opened={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Новая заметка">
        <TextInput
          label="Название"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.currentTarget.value)}
          mb="md"
        />
        <Button
          fullWidth
          onClick={() => {
            handleCreateNote(noteTitle, noteContent);
            setNoteModalOpen(false);
          }}
        >
          Сохранить
        </Button>
      </Modal>
    </Box>
  );
};
