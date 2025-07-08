import { IconSettings } from "@tabler/icons-react";
import { ActionIcon, ScrollArea, Tabs } from "@mantine/core";
import { IBlockInstance, IBlockInstanceGroup } from "@/entities/BookEntities";
import { IBlock, IBlockParameter } from "@/entities/ConstructorEntities";

interface IGroupTabsProps {
  block?: IBlock | null;
  groups?: IBlockInstanceGroup[];
  linkGroups?: IBlockInstance[];
  groupingParam?: IBlockParameter | undefined;
  currentGroupUuid: string;
  onChange: (uuid: string) => void;
  onSettings?: () => void;
}

/**
 * Табы для переключения групп экземпляров
 */
export const BlockInstanceGroupTabs = ({
  block,
  groups,
  linkGroups,
  groupingParam,
  currentGroupUuid,
  onChange,
  onSettings,
}: IGroupTabsProps) => {
  if (!block) return null;

  const renderGroupTabs = () => {
    if (block.useGroups === 1) {
      return (
        <Tabs.List style={{ flexWrap: "nowrap" }}>
          <Tabs.Tab value="none">Без групп</Tabs.Tab>
          {groups?.map((g) => (
            <Tabs.Tab key={g.uuid} value={g.uuid}>
              {g.title}
            </Tabs.Tab>
          ))}
          {onSettings && (
            <ActionIcon onClick={onSettings} variant="subtle" mt="3">
              <IconSettings size="1rem" />
            </ActionIcon>
          )}
        </Tabs.List>
      );
    }

    if (groupingParam) {
      return (
        <Tabs.List style={{ flexWrap: "nowrap" }}>
          <Tabs.Tab value="none">Все</Tabs.Tab>
          {linkGroups?.map((g) => (
            <Tabs.Tab key={g.uuid} value={g.uuid}>
              {g.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      );
    }

    return null;
  };

  if (block.useGroups !== 1 && !groupingParam) return null;

  return (
    <ScrollArea
      type="hover"
      offsetScrollbars
      styles={{ root: { maxWidth: "100%" }, viewport: { scrollBehavior: "smooth" } }}
    >
      <Tabs
        value={currentGroupUuid}
        onChange={(val) => onChange(val || "none")}
        mb={10}
        styles={{ root: { minWidth: "100%" } }}
      >
        {renderGroupTabs()}
      </Tabs>
    </ScrollArea>
  );
};
