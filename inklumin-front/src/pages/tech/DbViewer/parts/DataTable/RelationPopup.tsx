import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Popover, Text } from "@mantine/core";

interface RelationPopupProps {
  relatedEntry: any;
}

export const RelationPopup = ({ relatedEntry }: RelationPopupProps) => (
  <Popover>
    <Popover.Target>
      <ActionIcon size="xs" onClick={(e) => e.stopPropagation()}>
        <IconInfoCircle style={{ width: "14px", height: "14px" }} />
      </ActionIcon>
    </Popover.Target>
    <Popover.Dropdown>
      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(relatedEntry, null, 2)}
      </Text>
    </Popover.Dropdown>
  </Popover>
);
