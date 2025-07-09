import { useState } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance } from "@/entities/BookEntities";

interface IInstanceSelectorProps {
  blockUuid: string;
  groupUuid?: string | null;
  selectedUuid: string | null;
  onSelect: (uuid: string | null) => void;
  parentUuid?: string;
  level?: number;
  excludeUuids?: string[];
  includeTopLevel?: boolean;
  openedFolders?: Record<string, boolean>;
  onToggleFolder?: (uuid: string) => void;
}

/**
 * Элемент списка с рекурсивным отображением детей
 */
const InstanceItem = ({
  instance,
  blockUuid,
  groupUuid,
  selectedUuid,
  onSelect,
  level = 0,
  excludeUuids = [],
  openedFolders = {},
  onToggleFolder = () => {},
}: {
  instance: IBlockInstance;
  blockUuid: string;
  groupUuid?: string | null;
  selectedUuid: string | null;
  onSelect: (uuid: string | null) => void;
  level?: number;
  excludeUuids?: string[];
  openedFolders?: Record<string, boolean>;
  onToggleFolder?: (uuid: string) => void;
}) => {
  const children = useLiveQuery(() => {
    return bookDb.blockInstances
      .where("parentInstanceUuid")
      .equals(instance.uuid!)
      .filter((i) => {
        if (excludeUuids.includes(i.uuid!)) return false;
        if (groupUuid === undefined) return true;
        if (groupUuid === "none") return !i.blockInstanceGroupUuid;
        return i.blockInstanceGroupUuid === groupUuid;
      })
      .toArray();
  }, [blockUuid, groupUuid, instance.uuid, excludeUuids.join("|")]);

  const hasChildren = (children?.length || 0) > 0;

  return (
    <Box style={{ marginLeft: level * 20 }} w="100%">
      <Group
        justify="space-between"
        style={{ cursor: "pointer", padding: "4px 8px", width: "100%" }}
        onClick={() => onSelect(instance.uuid!)}
        bg={selectedUuid === instance.uuid ? "var(--mantine-color-blue-light)" : undefined}
      >
        <Group gap="xs">
          {hasChildren && (
            <ActionIcon
              variant="transparent"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolder(instance.uuid!);
              }}
            >
              {openedFolders[instance.uuid!] ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ActionIcon>
          )}
          {!hasChildren && <Box style={{ width: 24 }} />}
          <Text size="sm">{instance.title}</Text>
        </Group>
      </Group>
      {openedFolders[instance.uuid!] && hasChildren && (
        <Box>
          {children?.map((child) => (
            <InstanceItem
              key={child.uuid}
              instance={child}
              blockUuid={blockUuid}
              groupUuid={groupUuid}
              selectedUuid={selectedUuid}
              onSelect={onSelect}
              level={level + 1}
              excludeUuids={excludeUuids}
              openedFolders={openedFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export const InstanceSelector = ({
  blockUuid,
  groupUuid,
  selectedUuid,
  onSelect,
  parentUuid = "topLevel",
  level = 0,
  excludeUuids = [],
  includeTopLevel = false,
}: IInstanceSelectorProps) => {
  const [openedFolders, setOpenedFolders] = useState<Record<string, boolean>>({});

  const instances = useLiveQuery(() => {
    if (parentUuid === "topLevel") {
      return bookDb.blockInstances
        .where("blockUuid")
        .equals(blockUuid)
        .filter((i) => {
          const noParent = !i.parentInstanceUuid;
          if (!noParent) return false;
          if (excludeUuids.includes(i.uuid!)) return false;
          if (groupUuid === undefined) return true;
          if (groupUuid === "none") return !i.blockInstanceGroupUuid;
          return i.blockInstanceGroupUuid === groupUuid;
        })
        .toArray();
    }
    return bookDb.blockInstances
      .where("parentInstanceUuid")
      .equals(parentUuid)
      .filter((i) => {
        if (excludeUuids.includes(i.uuid!)) return false;
        if (groupUuid === undefined) return true;
        if (groupUuid === "none") return !i.blockInstanceGroupUuid;
        return i.blockInstanceGroupUuid === groupUuid;
      })
      .toArray();
  }, [blockUuid, parentUuid, groupUuid, excludeUuids.join("|")]);

  const handleToggle = (uuid: string) => {
    setOpenedFolders((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  return (
    <Box>
      {includeTopLevel && level === 0 && (
        <Box w="100%" style={{ marginLeft: level * 20 }}>
          <Group
            justify="space-between"
            style={{ cursor: "pointer", padding: "4px 8px", width: "100%" }}
            onClick={() => onSelect(null)}
            bg={selectedUuid === null ? "var(--mantine-color-blue-light)" : undefined}
          >
            <Text size="sm">Корневой уровень</Text>
          </Group>
        </Box>
      )}
      {instances?.map((inst) => (
        <InstanceItem
          key={inst.uuid}
          instance={inst}
          blockUuid={blockUuid}
          groupUuid={groupUuid}
          selectedUuid={selectedUuid}
          onSelect={onSelect}
          level={level}
          excludeUuids={excludeUuids}
          openedFolders={openedFolders}
          onToggleFolder={handleToggle}
        />
      ))}
    </Box>
  );
};
