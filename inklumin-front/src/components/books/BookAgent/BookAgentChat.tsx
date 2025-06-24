import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Text,
  Textarea,
  Select,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";
import { notifications } from "@mantine/notifications";
import { bookAgent, AgentMessage } from "@/agents/bookAgent";
import {
  createBlock,
  createBlockInstance,
  saveParamInstance,
} from "@/agents/bookAgentActions";
import { useApiSettingsStore } from "@/stores/apiSettingsStore/apiSettingsStore";

export const BookAgentChat = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    openRouterModels,
    currentOpenRouterModel,
    setCurrentOpenRouterModel,
  } = useApiSettingsStore();

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
    const regex = /\[\[(.+?)\|(.*?)\]\]/g;
    const parts: (string | { action: string; params: any })[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      let params: any = {};
      try {
        params = JSON.parse(match[2]);
      } catch {}
      parts.push({ action: match[1], params });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    return parts;
  };

  const handleAction = async (act: string, params: any) => {
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
            <Text fw={700} mb="xs">
              {m.role === "user" ? "Вы" : "Агент"}
            </Text>
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
    </Box>
  );
};
