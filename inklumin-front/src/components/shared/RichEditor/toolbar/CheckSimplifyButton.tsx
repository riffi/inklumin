import { useState } from "react";
import { IconBulb, IconIrregularPolyhedronOff } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import { RichTextEditor } from "@mantine/tiptap";
import { OpenRouterApi } from "@/api/openRouterApi";

interface CheckSimplifyButtonProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onSimplificationsFound: (simplifications: string[]) => void;
}

export const CheckSimplifyButton = ({
  editor,
  onLoadingChange,
  onSimplificationsFound,
}: CheckSimplifyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      notifications.show({
        message: "Выделите текст для упрощения",
        color: "orange",
      });
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Упрощаем текст...");
      const simplifications = await OpenRouterApi.fetchSimplifications(selectedText);
      onSimplificationsFound(simplifications);
    } catch (error) {
      notifications.show({
        message: error.message,
        color: "red",
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <RichTextEditor.Control onClick={handleClick} title="Упростить текст" disabled={isLoading}>
      <IconIrregularPolyhedronOff size={20} color={"gray"} />
    </RichTextEditor.Control>
  );
};
