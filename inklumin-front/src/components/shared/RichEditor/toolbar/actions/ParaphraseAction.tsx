import { useState } from "react";
import { IconEyeTable } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OpenRouterApi } from "@/api/openRouterApi";

interface ParaphraseActionProps {
  editor: ReturnType<typeof useEditor>;
  selectedText: string;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (paraphrases: string[]) => void;
}

export const ParaphraseAction = ({
  editor,
  selectedText,
  onLoadingChange,
  onFound,
}: ParaphraseActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    editor.setEditable(false);

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
