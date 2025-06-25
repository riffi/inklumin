import { useState } from "react";
import { IconIrregularPolyhedronOff } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OpenRouterApi } from "@/api/openRouterApi";

interface SimplifyActionProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (simplifications: string[]) => void;
}

export const SimplifyAction = ({ editor, onLoadingChange, onFound }: SimplifyActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      notifications.show({ message: "Выделите текст для упрощения", color: "orange" });
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Упрощаем текст...");
      const simplifications = await OpenRouterApi.fetchSimplifications(selectedText);
      onFound(simplifications);
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
      leftSection={<IconIrregularPolyhedronOff size={16} />}
      variant="outline"
    >
      Упростить
    </Button>
  );
};
