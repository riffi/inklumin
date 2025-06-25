import { useState } from "react";
import { IconEyeTable } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OpenRouterApi } from "@/api/openRouterApi";

interface ParaphraseActionProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (paraphrases: string[]) => void;
}

export const ParaphraseAction = ({ editor, onLoadingChange, onFound }: ParaphraseActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      notifications.show({ message: "Выделите текст для перефразирования", color: "orange" });
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Генерируем варианты...");
      const paraphrases = await OpenRouterApi.fetchParaphrases(selectedText);
      onFound(paraphrases);
    } catch (error) {
      notifications.show({ message: (error as Error).message, color: "red" });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={isLoading}
      leftSection={<IconEyeTable size={16} />}
      variant="outline"
    >
      Перефразировать
    </Button>
  );
};
