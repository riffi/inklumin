import { useState } from "react";
import { IconArrowsDoubleSwNe } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { InkLuminMlApi } from "@/api/inkLuminMlApi";
import { repeatHighlighterKey } from "@/components/shared/RichEditor/plugins/RepeatHighlighterExtension";
import { IWarningGroup } from "@/components/shared/RichEditor/types";

interface CheckRepeatsActionProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onClose: () => void;
}

export const CheckRepeatsAction = ({
  editor,
  onLoadingChange,
  isActive,
  setIsActive,
  onClose,
}: CheckRepeatsActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateHighlights = (warningGroups: IWarningGroup[]) => {
    const tr = editor.state.tr;
    tr.setMeta(repeatHighlighterKey, { action: "UPDATE_DECORATIONS", warningGroups });
    editor.view.dispatch(tr);
  };

  const handleClick = async () => {

    if (isActive) {
      updateHighlights([]);
      setIsActive(false);
      return;
    }
    onClose();
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

  return (
    <Button
      onClick={handleClick}
      loading={isLoading}
      variant={isActive ? "filled" : "outline"}
      leftSection={<IconArrowsDoubleSwNe size={16} />}
    >
      {isActive ? "Скрыть повторы" : "Найти повторы"}
    </Button>
  );
};
