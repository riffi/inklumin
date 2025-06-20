import { useState } from "react";
import { IconArrowsDoubleSwNe } from "@tabler/icons-react";
import { RichTextEditor } from "@mantine/tiptap";
import { InkLuminMlApi } from "@/api/inkLuminMlApi";
import { repeatHighlighterKey } from "@/components/shared/RichEditor/plugins/RepeatHighlighterExtension";
import { IWarningGroup } from "@/components/shared/RichEditor/types";

interface CheckRepeatsButtonProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
}

export const CheckRepeatsButton = ({ editor, onLoadingChange }: CheckRepeatsButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckRepeats = async () => {
    if (isActive) {
      clearHighlights();
      setIsActive(false);
      return;
    }

    onLoadingChange(true, "Анализ текста на повторения...");
    setIsLoading(true);
    try {
      const text = editor.getText();
      const warningGroups = await InkLuminMlApi.fetchRepeats(text);
      updateHighlights(warningGroups);
      setIsActive(true);
    } catch (error) {
      console.error("Error checking repeats:", error);
    } finally {
      onLoadingChange(false);
      setIsLoading(false);
    }
  };

  const updateHighlights = (warningGroups: IWarningGroup[]) => {
    const tr = editor.state.tr;
    tr.setMeta(repeatHighlighterKey, {
      // Используем pluginKey вместо строки
      action: "UPDATE_DECORATIONS",
      warningGroups,
    });
    editor.view.dispatch(tr);
  };

  const clearHighlights = () => {
    updateHighlights([]);
  };

  return (
    <RichTextEditor.Control
      onClick={handleCheckRepeats}
      title="Проверить повторения"
      active={isActive}
      disabled={isLoading}
    >
      <IconArrowsDoubleSwNe size={20} color={"gray"} />
    </RichTextEditor.Control>
  );
};
