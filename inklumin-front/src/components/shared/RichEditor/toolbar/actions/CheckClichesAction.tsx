import { useState } from "react";
import { IconHandStop } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { InkLuminMlApi } from "@/api/inkLuminMlApi";
import { clicheHighlighterKey } from "@/components/shared/RichEditor/plugins/ClisheHightligherExtension";
import { IWarningGroup } from "@/components/shared/RichEditor/types";

interface CheckClichesActionProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export const CheckClichesAction = ({
  editor,
  onLoadingChange,
  isActive,
  setIsActive,
}: CheckClichesActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateHighlights = (warningGroups: IWarningGroup[]) => {
    const tr = editor.state.tr;
    tr.setMeta(clicheHighlighterKey, { action: "UPDATE_DECORATIONS", warningGroups });
    editor.view.dispatch(tr);
  };

  const handleClick = async () => {
    if (isActive) {
      updateHighlights([]);
      setIsActive(false);
      return;
    }
    onLoadingChange(true, "Поиск фраз-штампов...");
    setIsLoading(true);
    try {
      const text = editor.getText();
      const cliches = await InkLuminMlApi.fetchCliches(text);
      updateHighlights(cliches);
      setIsActive(true);
    } catch (error) {
      notifications.show({ message: (error as Error).message, color: "red" });
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
      leftSection={<IconHandStop size={16} />}
    >
      {isActive ? "Скрыть штампы" : "Найти штампы"}
    </Button>
  );
};
