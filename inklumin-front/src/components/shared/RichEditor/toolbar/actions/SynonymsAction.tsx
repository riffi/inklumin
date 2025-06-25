import { useState } from "react";
import { IconLayersLinked } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OpenRouterApi } from "@/api/openRouterApi";

interface SynonymsActionProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (synonyms: string[]) => void;
}

export const SynonymsAction = ({ editor, onLoadingChange, onFound }: SynonymsActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (selectedText.trim().split(/\s+/).length > 1) {
      notifications.show({ message: "Выделите только одно слово", color: "orange" });
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Ищем синонимы...");
      const synonyms = await OpenRouterApi.fetchSynonyms(selectedText);
      onFound(synonyms);
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
      leftSection={<IconLayersLinked size={16} />}
      variant="outline"
    >
      Синонимы
    </Button>
  );
};
