// CheckClichesButton.tsx
import { useState } from "react";
import { IconClipboardCheck, IconHandStop, IconLayersLinked } from "@tabler/icons-react";
import { PluginKey } from "prosemirror-state";
import { ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { RichTextEditor } from "@mantine/tiptap";
import { InkLuminMlApi } from "@/api/inkLuminMlApi";
import { clicheHighlighterKey } from "@/components/shared/RichEditor/plugins/ClisheHightligherExtension";
import { IClicheWarning, IWarningGroup, IWarningKind } from "@/components/shared/RichEditor/types";
import { generateUUID } from "@/utils/UUIDUtils";

interface CheckClichesButtonProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
}

export const CheckClichesButton = ({ editor, onLoadingChange }: CheckClichesButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckCliches = async () => {
    if (isActive) {
      clearHighlights();
      setIsActive(false);
      return;
    }

    onLoadingChange(true, "Поиск фраз-штампов...");
    setIsLoading(true);
    try {
      const text = editor.getText();
      const cliches = await InkLuminMlApi.fetchCliches(text);
      console.log(cliches);
      updateHighlights(cliches);
      setIsActive(true);
    } catch (error) {
      notifications.show({
        message: error.message,
        color: "red",
      });
      console.error("Error checking cliches:", error);
    } finally {
      onLoadingChange(false);
      setIsLoading(false);
    }
  };

  const updateHighlights = (warningGroups: IWarningGroup[]) => {
    const tr = editor.state.tr;
    tr.setMeta(clicheHighlighterKey, {
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
      onClick={handleCheckCliches}
      icon={<IconClipboardCheck />}
      title="Проверить штампы"
      active={isActive}
      disabled={isLoading}
    >
      <IconHandStop size={20} color={"gray"} />
    </RichTextEditor.Control>
  );
};
