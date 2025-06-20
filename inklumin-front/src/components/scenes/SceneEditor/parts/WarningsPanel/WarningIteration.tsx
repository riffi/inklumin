// components/WarningsPanel/WarningIteration.tsx
import { IconAlertCircle, IconCircle, IconInfoCircle, IconRepeat } from "@tabler/icons-react";
import { Group, List, Paper, Text, ThemeIcon } from "@mantine/core";
import { WarningGroup } from "@/components/scenes/SceneEditor/parts/WarningsPanel/WarningGroup";
import { IWarning, IWarningGroup, IWarningKind } from "@/components/shared/RichEditor/types";
import { NavigationButtons } from "./NavigationButtons";

export interface IWarningIterationProps {
  warningGroups: IWarningGroup[];
  selectedGroup?: IWarningGroup;
  currentIndex?: number;
  onSelectGroup: (warningGroup: IWarningGroup) => void;
}
export const WarningIteration = (props: IWarningIterationProps) => {
  const currentGroup = props.warningGroups?.[props.currentIndex] ?? props.warningGroups?.[0];

  if (!currentGroup) {
    return (
      <Text size="sm" c="dimmed">
        Нет замечаний
      </Text>
    );
  }

  return (
    <div style={{ padding: 2 }}>
      <NavigationButtons
        currentIndex={props.currentIndex}
        total={props.warningGroups.length}
        onNavigate={(direction) => {
          const newIndex = direction === "prev" ? props.currentIndex - 1 : props.currentIndex + 1;
          props.onSelectGroup?.(props.warningGroups?.[newIndex]);
        }}
      />

      <div style={{ marginTop: 8 }}>
        <WarningGroup warningGroup={currentGroup} onSelectGroup={props.onSelectGroup} />
      </div>
    </div>
  );
};
