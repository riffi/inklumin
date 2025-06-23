import { useState } from "react";
import { Box, Button, LoadingOverlay, Stack, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { bookAgent } from "@/agents/bookAgent";

export const BookAgentChat = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const result = await bookAgent(question);
      setAnswer(result);
    } catch (e: any) {
      notifications.show({ message: e.message ?? "Ошибка" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative" maw={600} mx="auto">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      <Stack>
        <Textarea
          placeholder="Введите запрос"
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />
        <Button onClick={handleAsk}>Отправить</Button>
        {answer && <Textarea value={answer} readOnly minRows={6} />}
      </Stack>
    </Box>
  );
};
