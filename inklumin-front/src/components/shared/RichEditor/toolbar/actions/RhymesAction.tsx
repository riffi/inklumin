import { useState } from "react";
import { IconPencil } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { OpenRouterApi } from "@/api/openRouterApi";

interface RhymesActionProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (rhymes: string[]) => void;
}

export const RhymesAction = ({ editor, onLoadingChange, onFound }: RhymesActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (selectedText.trim().split(/\s+/).length > 1) {
      alert("Выделите только одно слово");
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Ищем рифмы...");
      const rhymes = await OpenRouterApi.fetchRhymes(selectedText);
      onFound(rhymes);
    } catch (error) {
      console.error("Error fetching rhymes:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={isLoading}
      leftSection={<IconPencil size={16} />}
      variant="outline"
    >
      Рифмы
    </Button>
  );
};
