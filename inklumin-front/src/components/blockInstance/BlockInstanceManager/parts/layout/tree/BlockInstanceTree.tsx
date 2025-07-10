import React, { useMemo, useState } from "react";
import {
  IconArrowRightCircleFilled,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {ActionIcon, Badge, Box, Collapse, Group, Stack, Text} from "@mantine/core";
import classes from "./BlockInstanceTree.module.css";
import { IBlockInstanceWithParams } from "@/components/blockInstance/BlockInstanceManager/hooks/useBlockInstanceManager";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import {
  ActionItem,
  RowActionButtons,
} from "@/components/shared/RowActionButtons/RowActionButtons";
import { IBlockInstance } from "@/entities/BookEntities";
import {IBlock, IBlockParameter, IBlockParameterDataType} from "@/entities/ConstructorEntities";
import {useMedia} from "@/providers/MediaQueryProvider/MediaQueryProvider";
import {
  ParameterViewVariantRenderer
} from "@/components/shared/blockParameter/ParameterViewVariantRenderer/ParameterViewVariantRenderer";

interface IInstanceTreeNode extends IBlockInstanceWithParams {
  children: IInstanceTreeNode[];
}

interface IBlockInstanceTreeProps {
  instances: IBlockInstanceWithParams[];
  displayedParameters?: IBlockParameter[];
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
                                    displayedParameters,
                                    block,
                                    onAddChild,
                                    onEdit,
                                    onDelete,
                                    onMove,
                                  }: IBlockInstanceTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const {isMobile} = useMedia()

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
                p={isMobile ? "8px 0px" : "8px 8px"}
                className={classes.row}
                style={{
                  marginLeft: level * (isMobile ? 12 : 24),
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
                    size={isMobile ? 25 : 35}
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
                        style={{ cursor: "pointer"}}
                        className={classes.description}
                        truncate
                    >
                      {node.description}
                    </Text>
                )}
                <Group
                    gap="0"
                    style={{
                      /*@TODO убрать костыль */
                      marginTop: "-3px",
                    }}
                >
                  {displayedParameters?.map((param, index) => {
                    const paramInstance = node.params?.find(
                        (p) => p.blockParameterUuid === param.uuid
                    );
                    if (!paramInstance) return;
                    return (
                        <Badge
                            key={param.uuid}
                            variant="transparent"
                            color="#BBB"
                            style={{
                              fontSize: "0.8rem",
                              textTransform: "lowercase",
                              fontWeight: 400,
                              paddingLeft: "0px",
                              borderRadius: "0",
                              cursor: "pointer",
                            }}
                        >
                          <Group
                              gap={5}
                              style={{
                                borderRight:
                                    index < displayedParameters?.length - 1 ? "1px solid #EEE" : "none",
                                paddingRight: "10px",
                              }}
                          >
                            <Text size={12}>{param.title}: </Text>

                            <ParameterViewVariantRenderer
                                dataType={param.dataType}
                                value={
                                  param.dataType === IBlockParameterDataType.blockLink
                                      ? paramInstance?.linkedBlockInstanceUuid || ""
                                      : paramInstance?.value || ""
                                }
                            />
                          </Group>
                        </Badge>
                    );
                  })}
                </Group>
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
