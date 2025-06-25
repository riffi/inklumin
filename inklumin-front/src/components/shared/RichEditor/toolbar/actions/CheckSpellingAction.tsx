import { useState } from "react";
import { IconArrowsDoubleSwNe, IconChecks, IconTextSpellcheck } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { YandexSpellerApi } from "@/api/yandexSpellerApi";
import { spellingHighlighterKey } from "@/components/shared/RichEditor/plugins/SpellingHighlighterExtension";
import { IWarningGroup } from "@/components/shared/RichEditor/types";

interface CheckSpellingActionProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onClose: () => void;
}

export const CheckSpellingAction = ({
  editor,
  onLoadingChange,
  isActive,
  setIsActive,
  onClose,
}: CheckSpellingActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateHighlights = (warningGroups: IWarningGroup[]) => {
    const tr = editor.state.tr;
    tr.setMeta(spellingHighlighterKey, { action: "UPDATE_DECORATIONS", warningGroups });
    editor.view.dispatch(tr);
  };

  const handleClick = async () => {
    if (isActive) {
      updateHighlights([]);
      setIsActive(false);
      return;
    }
    onClose();
    onLoadingChange(true, "Проверяем орфографию...");
    setIsLoading(true);
    try {
      const text = editor.getText();
      const groups = await YandexSpellerApi.fetchSpellingGroups(text);
      updateHighlights(groups);
      setIsActive(true);
    } catch (error) {
      console.error("Error checking spelling:", error);
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
      leftSection={<IconTextSpellcheck size={16} />}
    >
      {isActive ? "Скрыть проверку оргографии" : "Проверить орфографию"}
    </Button>
  );
};
