// components/WarningsPanel/WarningIteration.tsx
import { IconAlertCircle, IconCircle, IconInfoCircle, IconRepeat } from "@tabler/icons-react";
import { Group, List, Paper, Text, ThemeIcon } from "@mantine/core";
import { WarningGroup } from "@/components/shared/RichEditor/parts/WarningsPanel/WarningGroup";
import { IWarning, IWarningGroup, IWarningKind } from "@/components/shared/RichEditor/types";
import { NavigationButtons } from "./NavigationButtons";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

export interface IWarningIterationProps {
  warningGroups: IWarningGroup[];
  selectedGroup?: IWarningGroup;
  currentIndex?: number;
  onSelectGroup: (warningGroup: IWarningGroup) => void;
}

const mobileStyle={
    position: "fixed",
    height: "130px",
    left: 0,
    right: 0,
    zIndex: 200,
    bottom: 0,
    transition: "bottom 0.3s ease",
    padding: "8px",
    backgroundColor: "white",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
}

export const WarningIteration = (props: IWarningIterationProps) => {
  const currentGroup = props.warningGroups?.[props.currentIndex] ?? props.warningGroups?.[0];
  const {isMobile} = useMedia()

  if (!currentGroup) {
    return (
      <Text size="sm" c="dimmed">
        Нет замечаний
      </Text>
    );
  }

  return (
    <div style={isMobile? mobileStyle : { padding: 2, backgroundColor: "white" }}>
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
