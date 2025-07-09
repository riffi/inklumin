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
import classes from "./BlockInstanceTree.module.css";
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
    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes[node.uuid!];

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
          <Box key={node.uuid}>
            <Group
                gap={8}
                align="center"
                p="8px 12px"
                className={classes.row}
                style={{
                  marginLeft: level * 24,
                  position: 'relative'
                }}
            >

              {/* Кнопка сворачивания/разворачивания */}
              <Box style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                {hasChildren && (
                    <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => toggleNode(node.uuid!)}
                        className={classes.expandButton}
                    >
                      {isExpanded ? (
                          <IconChevronDown size={16} />
                      ) : (
                          <IconChevronRight size={16} />
                      )}
                    </ActionIcon>
                )}
              </Box>

              {/* Иконка блока */}
              <Box className={classes.iconContainer}>
                <IconViewer
                    icon={node.icon ?? block?.icon}
                    size={20}
                    color="rgb(102,102,102)"
                    backgroundColor="transparent"
                />
              </Box>

              {/* Контент */}
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text
                    style={{ cursor: "pointer" }}
                    onClick={() => onEdit(node.uuid!)}
                    className={classes.title}
                    truncate
                >
                  {node.title}
                </Text>
                {node.description && (
                    <Text
                        size="xs"
                        c="dimmed"
                        style={{ cursor: "pointer" }}
                        className={classes.description}
                        truncate
                    >
                      {node.description}
                    </Text>
                )}
              </Stack>

              {/* Кнопки действий */}
              <Box className={classes.actionsContainer}>
                <RowActionButtons actions={actions} entityId={node.uuid} />
              </Box>
            </Group>

            {/* Дочерние элементы */}
            {hasChildren && (
                <Collapse in={isExpanded}>
                  <Box className={classes.childrenContainer}>
                    {renderTree(node.children, level + 1)}
                  </Box>
                </Collapse>
            )}
          </Box>
      );
    });
  };

  if (instanceTree.length === 0) {
    return (
        <Box className={classes.emptyState}>
          <Text c="dimmed" ta="center" py="xl" size="sm">
            Добавьте {block?.titleForms?.accusative}
          </Text>
        </Box>
    );
  }

  return (
      <Box className={classes.container}>
        <Stack gap={0} mt="md">
          {renderTree(instanceTree)}
        </Stack>
      </Box>
  );
};
