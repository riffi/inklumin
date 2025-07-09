import React, { useMemo, useState } from "react";
import {
  IconArrowRightCircleFilled,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { ActionIcon, Box, Collapse, Group, Stack, Text } from "@mantine/core";
import { IBlockInstanceWithParams } from "@/components/blockInstance/BlockInstanceManager/hooks/useBlockInstanceManager";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import {
  ActionItem,
  RowActionButtons,
} from "@/components/shared/RowActionButtons/RowActionButtons";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";

interface IInstanceTreeNode extends IBlockInstanceWithParams {
  children: IInstanceTreeNode[];
}

interface IBlockInstanceTreeProps {
  instances: IBlockInstanceWithParams[];
  block?: IBlock | null;
  onAddChild: (uuid: string) => void;
  onEdit: (uuid: string) => void;
  onDelete: (instance: IBlockInstance) => void;
  onMove: (uuid: string) => void;
}

/**
 * Компонент отображает экземпляры блока в виде иерархического дерева
 */
export const BlockInstanceTree = ({
  instances,
  block,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
}: IBlockInstanceTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const instanceTree = useMemo(() => {
    const map = new Map<string, IInstanceTreeNode>();
    const roots: IInstanceTreeNode[] = [];
    instances.forEach((inst) => {
      map.set(inst.uuid!, { ...inst, children: [] });
    });
    instances.forEach((inst) => {
      const node = map.get(inst.uuid!);
      if (!node) return;
      const parent = inst.parentInstanceUuid ? map.get(inst.parentInstanceUuid) : null;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [instances]);

  const toggleNode = (uuid: string) => {
    setExpandedNodes((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  const renderTree = (nodes: IInstanceTreeNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => {
      const actions: ActionItem[] = [
        {
          title: "Добавить",
          icon: <IconPlus size={16} />,
          color: "green",
          handler: () => onAddChild(node.uuid!),
        },
        {
          title: "Редактировать",
          icon: <IconEdit size={16} />,
          handler: () => onEdit(node.uuid!),
        },
        {
          title: "Переместить",
          icon: <IconArrowRightCircleFilled size={16} />,
          handler: () => onMove(node.uuid!),
        },
        {
          title: "Удалить",
          icon: <IconTrash size={16} />,
          color: "red",
          handler: () => onDelete(node),
        },
      ];

      return (
        <Box key={node.uuid} ml={level * 20} pt={8}>
          <Group gap={4} align="center">
            {node.children.length > 0 && (
              <ActionIcon variant="subtle" onClick={() => toggleNode(node.uuid!)}>
                {expandedNodes[node.uuid!] ? (
                  <IconChevronDown size={16} />
                ) : (
                  <IconChevronRight size={16} />
                )}
              </ActionIcon>
            )}
            {node.children.length === 0 && <Box w={24} />}
            <IconViewer
              icon={node.icon ?? block?.icon}
              size={24}
              color="rgb(102,102,102)"
              backgroundColor="transparent"
            />
            <Stack gap={0} style={{ flex: 1 }}>
              <Text style={{ cursor: "pointer" }} onClick={() => onEdit(node.uuid!)}>
                {node.title}
              </Text>
              {node.description && (
                <Text size="sm" c="dimmed">
                  {node.description}
                </Text>
              )}
            </Stack>
            <RowActionButtons actions={actions} entityId={node.uuid} />
          </Group>
          {node.children.length > 0 && (
            <Collapse in={expandedNodes[node.uuid!]}>
              {" "}
              {renderTree(node.children, level + 1)}{" "}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  if (instanceTree.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md" size="sm">
        Добавьте {block?.titleForms?.accusative}
      </Text>
    );
  }

  return (
    <Box style={{
      padding: "0px 8px"
    }}>
      <Stack gap="xs" mt="md">
        {renderTree(instanceTree)}
      </Stack>
    </Box>
  );
};
