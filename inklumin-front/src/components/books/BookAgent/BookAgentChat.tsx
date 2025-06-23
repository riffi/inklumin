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
import { notifications } from "@mantine/notifications";
import { bookAgent, AgentMessage } from "@/agents/bookAgent";
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

  return (
    <Box pos="relative" maw={600} mx="auto">
      <Stack>
        {messages.map((m, idx) => (
          <Paper key={idx} shadow="xs" p="sm" radius="md">
            <Text fw={700} mb="xs">
              {m.role === "user" ? "Вы" : "Агент"}
            </Text>
            <Text>{m.content}</Text>
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
