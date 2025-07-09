import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  IconCalendar,
  IconPlus,
  IconSortAZ,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconTrash,
  IconArrowRightCircleFilled,
} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {
  Box,
  Container,
  Group,
  LoadingOverlay,
  MultiSelect,
  Space,
  Table,
  Text,
  Title,
  Stack,
  Collapse, ActionIcon,
} from "@mantine/core";
import {useDebouncedValue, useDisclosure} from "@mantine/hooks";
import {
  BlockInstanceEditor
} from "@/components/blockInstance/BlockInstanceEditor/BlockInstanceEditor";
import {
  InstanceGroupsModal
} from "@/components/blockInstance/BlockInstanceManager/modal/InstanceGroupsModal/InstanceGroupsModal";
import {
  BlockInstanceTableRow
} from "@/components/blockInstance/BlockInstanceManager/parts/BlockInstanceTableRow";
import {
  IBlockInstanceWithParams,
  useBlockInstanceManager
} from "@/components/blockInstance/BlockInstanceManager/hooks/useBlockInstanceManager";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { RowActionButtons, ActionItem } from "@/components/shared/RowActionButtons/RowActionButtons";
import {bookDb} from "@/entities/bookDb";
import {IBlockInstance} from "@/entities/BookEntities";
import {useDialog} from "@/providers/DialogProvider/DialogProvider";
import {useMedia} from "@/providers/MediaQueryProvider/MediaQueryProvider";
import {useMobileHeader} from "@/providers/PageTitleProvider/MobileHeaderProvider";
import {
  BlockParameterInstanceRepository
} from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import {useUiSettingsStore,} from "@/stores/uiSettingsStore/uiSettingsStore";
import {getBlockTitle} from "@/utils/configUtils";
import {generateUUID} from "@/utils/UUIDUtils";
import {useInstanceList} from "./hooks/useInstanceList";
import {AddInstanceModal} from "./modal/AddInstanceModal/AddInstanceModal";
import {MoveInstanceModal} from "./modal/MoveInstanceModal/MoveInstanceModal";
import {BlockInstanceGroupTabs} from "./parts/BlockInstanceGroupTabs";
import {BlockInstanceManagerToolbar} from "./parts/BlockInstanceManagerToolbar";
import classes from "./BlockInstanceManager.module.css";

export interface IBlockInstanceManagerProps {
  blockUuid: string;
}

export const BlockInstanceManager = (props: IBlockInstanceManagerProps) => {
  const [titleSearchQuery, setTitleSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(titleSearchQuery, 300);

  const {
    instances,
    block,
    addBlockInstance,
    groups,
    saveGroup,
    moveGroupUp,
    moveGroupDown,
    deleteGroup,
    instancesWithParams,
    displayedParameters,
    groupingParam,
    linkGroups,
    deleteBlockInstance,
  } = useBlockInstanceManager(props.blockUuid, debouncedQuery);

  const isSameBlock = <T extends { blockUuid: string }>(arr?: T[]) =>
    Array.isArray(arr) ? arr.every((i) => i.blockUuid === props.blockUuid) : false;

  const loading =
    // пока самого блока ещё нет или это блок не от текущего UUID
    !block ||
    block.uuid !== props.blockUuid ||
    // коллекции ещё загружаются
    instances === undefined ||
    groups === undefined ||
    displayedParameters === undefined ||
    instancesWithParams === undefined ||
    // коллекции уже есть, но относятся к предыдущему blockUuid
    !isSameBlock(instances) ||
    !isSameBlock(groups);

  const [addingInstance, setAddingInstance] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [currentGroupUuid, setCurrentGroupUuid] = useState<string | "none">("none");
  const [groupsModalOpened, setGroupsModalOpened] = useState(false);
  const [movingInstanceUuid, setMovingInstanceUuid] = useState<string | null>(null);
  const [selectedMoveGroup, setSelectedMoveGroup] = useState<string>("none");
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const [filtersVisible, { toggle: toggleFilters, close: closeFilters }] = useDisclosure(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const { isMobile } = useMedia();
  const { blockInstanceSortType, setBlockInstanceSortType } = useUiSettingsStore();

  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const { setHeader } = useMobileHeader();

  const { uniqueParamValuesMap, getByGroup, visibleLinkGroups } = useInstanceList(
    instancesWithParams,
    displayedParameters,
    groupingParam,
    currentGroupUuid,
    groups,
    linkGroups,
    block,
    blockInstanceSortType
  );

  const desktopHeader = (
    <Group>
      {block?.icon && (
          <IconViewer
              icon={block?.icon}
              size={isMobile ? 20 : 30}
              style={{
                color: isMobile ? "white" : "rgb(104 151 191)",
                boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                backgroundColor: isMobile ? "var(--mantine-color-blue-5)" : "white",
              }}
          />
      )}
      <Title
        order={isMobile ? 4 : 2}
        style={{
          textTransform: "capitalize",
          color: isMobile ? "var(--mantine-color-blue-5)" : "white",
        }}
      >
        {getBlockTitle(block)}
      </Title>
    </Group>
  );

  useEffect(() => {
    if (block) {
      const actions = isMobile
        ? [
            {
              title: "Добавить",
              icon: <IconPlus size="1rem" />,
              handler: handleAddClick,
            },
            {
              title: "Сортировать по дате",
              icon: <IconCalendar size="1rem" />,
              handler: () => setBlockInstanceSortType("date"),
              active: blockInstanceSortType === "date",
            },
            {
              title: "Сортировать по алфавиту",
              icon: <IconSortAZ size="1rem" />,
              handler: () => setBlockInstanceSortType("title"),
              active: blockInstanceSortType === "title",
            },
          ]
        : undefined;

      setHeader({
        title: getBlockTitle(block),
        icon: block.icon,
        actions,
      });
    }
    return () => setHeader(null);
  }, [block, isMobile, blockInstanceSortType]);

  const handleAddClick = () => {
    setParentForNew(null);
    open();
  };

  const handleCreateInstance = async (
    name: string,
    description: string,
    group: string,
    parentUuid?: string,
  ) => {
    if (!bookDb || !name.trim()) return;

    setAddingInstance(true);
    try {
      const uuid = generateUUID();
      const newInstance: IBlockInstance = {
        blockUuid: props.blockUuid,
        uuid,
        title: name.trim(),
        description: description.trim() ? description.trim() : undefined,
        blockInstanceGroupUuid: block?.useGroups === 1 && group !== "none" ? group : undefined,
        parentInstanceUuid: parentUuid || undefined,
      };
      await addBlockInstance(newInstance);
      if (groupingParam && block?.useGroups !== 1 && group !== "none") {
        const paramInstance = {
          uuid: generateUUID(),
          blockInstanceUuid: uuid,
          blockParameterUuid: groupingParam.uuid!,
          blockParameterGroupUuid: groupingParam.groupUuid,
          value: group,
        };
        await BlockParameterInstanceRepository.addParameterInstance(bookDb, paramInstance);
      }
      close();
      setParentForNew(null);
     // navigate(`/block-instance/card?uuid=${uuid}`);
    } finally {
      setAddingInstance(false);
    }
  };

  const handleEditInstance = (uuid: string) => {
    navigate(`/block-instance/card?uuid=${uuid}`);
  };

  const handleDeleteInstance = async (data: IBlockInstance) => {
    const result = await showDialog("Вы уверены?", `Удалить ${data.title}?`);
    if (result && bookDb) {
      await deleteBlockInstance(data);
    }
  };

  const handleMoveInstance = (uuid: string) => {
    setMovingInstanceUuid(uuid);
  };

  //@TODO перенести в репозиторий и вызывать updateBook
  const handleConfirmMove = async () => {
    if (!movingInstanceUuid) return;
    const target = selectedMoveGroup === "none" ? undefined : selectedMoveGroup;
    await bookDb.blockInstances
      .where("uuid")
      .equals(movingInstanceUuid)
      .modify({ blockInstanceGroupUuid: target });
    setMovingInstanceUuid(null);
  };

  const displayedInstancesByGroup = useMemo(
      () => (instancesWithParams ? getByGroup(instancesWithParams, filters) : []),
      [instancesWithParams, filters, getByGroup]
  );

  interface IInstanceTreeNode extends IBlockInstanceWithParams {
    children: IInstanceTreeNode[];
  }

  const instanceTree = useMemo(() => {
    const map = new Map<string, IInstanceTreeNode>();
    const roots: IInstanceTreeNode[] = [];
    displayedInstancesByGroup.forEach((inst) => {
      map.set(inst.uuid!, { ...inst, children: [] });
    });
    displayedInstancesByGroup.forEach((inst) => {
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
  }, [displayedInstancesByGroup]);

  // Обработчики фильтров
  const handleFilterChange = useCallback((paramUuid: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [paramUuid]: values,
    }));
  }, []);

  const clearFilters = () => {
    setFilters({});
    closeFilters();
  };

  const renderTree = (nodes: IInstanceTreeNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => {
      const actions: ActionItem[] = [
        {
          title: "Редактировать",
          icon: <IconEdit size={16} />,
          handler: () => handleEditInstance(node.uuid!),
        },
        {
          title: "Переместить",
          icon: <IconArrowRightCircleFilled size={16} />,
          handler: () => handleMoveInstance(node.uuid!),
        },
        {
          title: "Удалить",
          icon: <IconTrash size={16} />,
          color: "red",
          handler: () => handleDeleteInstance(node),
        },
      ];

      return (
        <Box key={node.uuid} ml={level * 20} pt={5} pb={5}>
          <Group gap={4} align="center">
            {node.children.length > 0 && (
              <ActionIcon variant="subtle" onClick={() => toggleNode(node.uuid!)}>
                {expandedNodes[node.uuid!] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </ActionIcon>
            )}
            {node.children.length === 0 && <Box w={24} />}
            <IconViewer icon={node.icon ?? block?.icon} size={24} color="rgb(102,102,102)" backgroundColor="transparent" />
            <Stack gap={0} style={{ flex: 1 }} >
              <Text style={{ cursor: "pointer" }} onClick={() => handleEditInstance(node.uuid!)}>
                {node.title}
              </Text>
              {node.description && (
                <Text size="sm" c="dimmed">
                  {node.description}
                </Text>
              )}
            </Stack>
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => {
                setParentForNew(node.uuid!);
                open();
              }}
              title="Добавить внутрь"
            >
              <IconPlus size={16} />
            </ActionIcon>
            <RowActionButtons actions={actions} entityId={node.uuid} />
          </Group>
          {node.children.length > 0 && (
            <Collapse in={expandedNodes[node.uuid!]}> {renderTree(node.children, level + 1)} </Collapse>
          )}
        </Box>
      );
    });
  };

  const toggleNode = (uuid: string) => {
    setExpandedNodes((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  if (block?.structureKind === "single") {
    if (loading || !instances || instances.length === 0) {
      return (
        <Container size="xl" p={0}>
          <Box className={classes.container} pos="relative">
            <LoadingOverlay visible={true} className={classes.overlay} />
          </Box>
        </Container>
      );
    }
    return (
      <Container size="xl" p={0}>
        <Box className={classes.container} pos="relative">
          <BlockInstanceEditor blockInstanceUuid={instances?.[0].uuid} />
        </Box>
      </Container>
    );
  }
  return (
    <Container size="xl" p={0}>
      <Box className={classes.container} pos="relative">
        <LoadingOverlay visible={loading} className={classes.overlay} />
        {!loading && (
          <>
            <Box
              visibleFrom={"sm"}
              style={{
                padding: "20px 20px",
                backgroundColor: "rgb(104 151 191)",
                borderRadius: "10px",
              }}
            >
              {desktopHeader}
            </Box>
            <Space h="md" />

            <BlockInstanceGroupTabs
              block={block}
              groups={groups || []}
              linkGroups={visibleLinkGroups}
              groupingParam={groupingParam}
              currentGroupUuid={currentGroupUuid}
              onChange={(val) => setCurrentGroupUuid(val)}
              onSettings={block?.useGroups === 1 ? () => setGroupsModalOpened(true) : undefined}
            />

            <BlockInstanceManagerToolbar
              titleSearchQuery={titleSearchQuery}
              onSearchChange={setTitleSearchQuery}
              onAddClick={handleAddClick}
              isMobile={isMobile}
              sortType={blockInstanceSortType}
              onChangeSort={(value) => setBlockInstanceSortType(value)}
              filtersVisible={filtersVisible}
              hasFilters={Object.keys(filters).length > 0}
              displayedParameters={displayedParameters}
              onToggleFilters={toggleFilters}
              onClearFilters={clearFilters}
            />

            {filtersVisible && displayedParameters && (
              <div className={classes.filtersContainer}>
                <Group gap="xs" mb="md">
                  {displayedParameters.map((param) => (
                    <MultiSelect
                      key={param.uuid}
                      label={param.title}
                      placeholder={filters[param.uuid!]?.length > 0 ? "" : param.title}
                      data={uniqueParamValuesMap[param.uuid!] || []}
                      value={filters[param.uuid!] || []}
                      onChange={(values) => handleFilterChange(param.uuid!, values)}
                      clearable
                      className={classes.filterInput}
                    />
                  ))}
                </Group>
              </div>
            )}
            {block?.treeView === 1 ? (
              <Stack gap="xs" mt="md">
                {instanceTree.length > 0 ? (
                  renderTree(instanceTree)
                ) : (
                  <Text c="dimmed" ta="center" py="md" size="sm">
                    Добавьте {block?.titleForms?.accusative}
                  </Text>
                )}
              </Stack>
            ) : (
              <Table highlightOnHover className={classes.table}>
                <>
                  {displayedInstancesByGroup.length > 0 ? (
                    <Table.Tbody>
                      {displayedInstancesByGroup.map((instance) => (
                        <BlockInstanceTableRow
                          key={instance.uuid!}
                          instance={instance}
                          block={block}
                          displayedParameters={displayedParameters}
                          onEdit={() => handleEditInstance(instance.uuid!)}
                          onDelete={() => handleDeleteInstance(instance)}
                          onMove={handleMoveInstance}
                        />
                      ))}
                    </Table.Tbody>
                  ) : (
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td colSpan={2}>
                          <Text c="dimmed" ta="center" py="md" size="sm">
                            Добавьте {block?.titleForms?.accusative}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  )}
                </>
              </Table>
            )}

            <AddInstanceModal
              opened={opened}
              onClose={() => { setParentForNew(null); close(); }}
              title={"Создание " + block?.titleForms?.genitive}
              groups={groups}
              currentGroupUuid={currentGroupUuid}
              useGroups={block?.useGroups === 1}
              onCreate={(name, desc, group) => handleCreateInstance(name, desc, group, parentForNew || undefined)}
              loading={addingInstance}
            />

            {block?.useGroups === 1 && (
              <InstanceGroupsModal
                opened={groupsModalOpened}
                onClose={() => setGroupsModalOpened(false)}
                groups={groups || []}
                onSaveGroup={(title) =>
                  saveGroup({ blockUuid: props.blockUuid, title, order: groups?.length || 0 })
                }
                onMoveGroupUp={moveGroupUp}
                onMoveGroupDown={moveGroupDown}
                onDeleteGroup={deleteGroup}
                onUpdateGroupTitle={(uuid, t) =>
                  saveGroup({ ...groups?.find((g) => g.uuid === uuid)!, title: t })
                }
              />
            )}

            {block?.useGroups === 1 && (
              <MoveInstanceModal
                opened={!!movingInstanceUuid}
                onClose={() => setMovingInstanceUuid(null)}
                groups={groups}
                selectedGroup={selectedMoveGroup}
                onChangeGroup={(v) => setSelectedMoveGroup(v)}
                onConfirm={handleConfirmMove}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};
