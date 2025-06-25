import { useState } from "react";
import { IconIrregularPolyhedronOff } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OpenRouterApi } from "@/api/openRouterApi";

interface SimplifyActionProps {
  editor: ReturnType<typeof useEditor>;
  selectedText: string;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (simplifications: string[]) => void;
}

export const SimplifyAction = ({
  editor,
  selectedText,
  onLoadingChange,
  onFound,
}: SimplifyActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    editor.setEditable(false);

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
