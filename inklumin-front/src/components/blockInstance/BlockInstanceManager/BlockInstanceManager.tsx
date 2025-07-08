import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconCalendar,
  IconFilter,
  IconFilterOff,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSortAZ,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  MultiSelect,
  ScrollArea,
  SegmentedControl,
  Select,
  Space,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { BlockInstanceEditor } from "@/components/blockInstance/BlockInstanceEditor/BlockInstanceEditor";
import { InstanceGroupsModal } from "@/components/blockInstance/BlockInstanceManager/modal/InstanceGroupsModal/InstanceGroupsModal";
import { BlockInstanceTableRow } from "@/components/blockInstance/BlockInstanceManager/parts/BlockInstanceTableRow";
import { useBlockInstanceManager } from "@/components/blockInstance/BlockInstanceManager/useBlockInstanceManager";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlockParameterDataType, IBlockStructureKind } from "@/entities/ConstructorEntities";
import { useDialog } from "@/providers/DialogProvider/DialogProvider";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import {
  BlockInstanceSortType,
  useUiSettingsStore,
} from "@/stores/uiSettingsStore/uiSettingsStore";
import { getBlockTitle } from "@/utils/configUtils";
import { generateUUID } from "@/utils/UUIDUtils";
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
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newShortDescription, setNewShortDescription] = useState("");
  const [currentGroupUuid, setCurrentGroupUuid] = useState<string | "none">("none");
  const [groupsModalOpened, setGroupsModalOpened] = useState(false);
  const [movingInstanceUuid, setMovingInstanceUuid] = useState<string | null>(null);
  const [selectedMoveGroup, setSelectedMoveGroup] = useState<string>("none");

  const [filtersVisible, { toggle: toggleFilters, close: closeFilters }] = useDisclosure(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const { isMobile } = useMedia();
  const { blockInstanceSortType, setBlockInstanceSortType } = useUiSettingsStore();

  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const { setHeader } = useMobileHeader();

  const header = (
    <Group>
      <IconViewer
        icon={block?.icon}
        size={isMobile ? 20 : 30}
        style={{
          color: isMobile ? "white" : "rgb(104 151 191)",
          boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
          backgroundColor: isMobile ? "var(--mantine-color-blue-5)" : "white",
        }}
      />
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
    setNewInstanceName("");
    setNewShortDescription("");
    open();
  };

  const handleCreateInstance = async () => {
    if (!bookDb || !newInstanceName.trim()) return;

    setAddingInstance(true);
    try {
      const uuid = generateUUID();
      const newInstance: IBlockInstance = {
        blockUuid: props.blockUuid,
        uuid,
        title: newInstanceName.trim(),
        description: newShortDescription.trim() ? newShortDescription.trim() : undefined,
        blockInstanceGroupUuid:
          block?.useGroups === 1 && currentGroupUuid !== "none" ? currentGroupUuid : undefined,
      };
      await addBlockInstance(newInstance);
      if (groupingParam && block?.useGroups !== 1 && currentGroupUuid !== "none") {
        const paramInstance = {
          uuid: generateUUID(),
          blockInstanceUuid: uuid,
          blockParameterUuid: groupingParam.uuid!,
          blockParameterGroupUuid: groupingParam.groupUuid,
          value: currentGroupUuid,
        };
        await BlockParameterInstanceRepository.addParameterInstance(bookDb, paramInstance);
      }
      setNewShortDescription("");
      close();
      navigate(`/block-instance/card?uuid=${uuid}`);
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

  // Функция для сбора уникальных значений параметров
  const uniqueParamValuesMap = useMemo(() => {
    if (!instancesWithParams || !displayedParameters)
      return {} as Record<string, { value: string; label: string }[]>;

    const map: Record<string, { value: string; label: string }[]> = {};

    displayedParameters.forEach((param) => {
      const values = new Map<string, string>();
      instancesWithParams.forEach((instance) => {
        instance.params.forEach((p) => {
          if (p.blockParameterUuid === param.uuid) {
            if (param.dataType === "blockLink") {
              values.set(p.linkedBlockInstanceUuid || "", p.displayValue || "—");
            } else {
              const valueKey = p.displayValue;
              values.set(valueKey, valueKey);
            }
          }
        });
      });

      map[param.uuid!] = Array.from(values.entries()).map(([value, label]) => ({ value, label }));
    });

    return map;
  }, [instancesWithParams, displayedParameters]);

  // Функция фильтрации данных
  const filteredInstances = useMemo(() => {
    if (!instancesWithParams) return [] as typeof instancesWithParams;
    return instancesWithParams.filter((instance) => {
      return Object.entries(filters).every(([paramUuid, values]) => {
        if (values.length === 0) return true;
        const param = instance.params.find((p) => p.blockParameterUuid === paramUuid);
        if (!param) return false;

        const displayedParam = displayedParameters?.find((p) => p.uuid === paramUuid);
        const valueToCompare =
          displayedParam?.dataType === IBlockParameterDataType.blockLink
            ? param.linkedBlockInstanceUuid || ""
            : param.displayValue;
        return values.includes(valueToCompare);
      });
    });
  }, [instancesWithParams, filters, displayedParameters]);

  const sortedAndFilteredInstances = useMemo(() => {
    const items = [...filteredInstances];
    items.sort((a, b) => {
      if (blockInstanceSortType === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
    return items;
  }, [filteredInstances, blockInstanceSortType]);

  const displayedInstancesByGroup = useMemo(() => {
    if (block?.useGroups === 1) {
      return sortedAndFilteredInstances.filter((i) =>
        currentGroupUuid === "none"
          ? !i.blockInstanceGroupUuid ||
            groups?.findIndex((g) => g.uuid === i.blockInstanceGroupUuid) === -1
          : i.blockInstanceGroupUuid === currentGroupUuid
      );
    }
    if (groupingParam) {
      return sortedAndFilteredInstances.filter((i) => {
        const param = i.params.find((p) => p.blockParameterUuid === groupingParam.uuid);
        if (currentGroupUuid === "none") {
          return true;
        }
        return param?.linkedBlockInstanceUuid === currentGroupUuid;
      });
    }
    return sortedAndFilteredInstances;
  }, [sortedAndFilteredInstances, currentGroupUuid, block, groupingParam, linkGroups]);

  const visibleLinkGroups = useMemo(() => {
    if (!linkGroups || !instancesWithParams || !groupingParam) return linkGroups;
    return linkGroups.filter((g) =>
      instancesWithParams.some((inst) =>
        inst.params.some(
          (p) => p.blockParameterUuid === groupingParam.uuid && p.linkedBlockInstanceUuid === g.uuid
        )
      )
    );
  }, [linkGroups, instancesWithParams, groupingParam]);

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
              {header}
            </Box>
            <Space h="md" />

            {block?.useGroups === 1 && (
              <ScrollArea
                type="hover"
                offsetScrollbars
                styles={{
                  root: { maxWidth: "100%" },
                  viewport: { scrollBehavior: "smooth" },
                }}
              >
                <Tabs
                  value={currentGroupUuid}
                  onChange={(val) => {
                    setCurrentGroupUuid(val || "none");
                  }}
                  mb={10}
                  styles={{ root: { minWidth: "100%" } }}
                >
                  <Tabs.List style={{ flexWrap: "nowrap" }}>
                    <Tabs.Tab value="none">Без групп</Tabs.Tab>
                    {groups?.map((g) => (
                      <Tabs.Tab key={g.uuid} value={g.uuid}>
                        {g.title}
                      </Tabs.Tab>
                    ))}
                    <ActionIcon onClick={() => setGroupsModalOpened(true)} variant="subtle" mt="3">
                      <IconSettings size="1rem" />
                    </ActionIcon>
                  </Tabs.List>
                </Tabs>
              </ScrollArea>
            )}
            {block?.useGroups !== 1 && groupingParam && (
              <ScrollArea
                type="hover"
                offsetScrollbars
                styles={{
                  root: { maxWidth: "100%" },
                  viewport: { scrollBehavior: "smooth" },
                }}
              >
                <Tabs
                  value={currentGroupUuid}
                  onChange={(val) => setCurrentGroupUuid(val || "none")}
                  mb={10}
                  styles={{ root: { minWidth: "100%" } }}
                >
                  <Tabs.List style={{ flexWrap: "nowrap" }}>
                    <Tabs.Tab value="none">Все</Tabs.Tab>
                    {visibleLinkGroups?.map((g) => (
                      <Tabs.Tab key={g.uuid} value={g.uuid}>
                        {g.title}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs>
              </ScrollArea>
            )}

            <Group justify="space-between" mb="md" px={"sm"}>
              {!isMobile && (
                <Button
                  onClick={handleAddClick}
                  leftSection={<IconPlus size="1rem" />}
                  size="sm"
                  variant="light"
                  className={classes.addButton}
                >
                  Добавить
                </Button>
              )}

              <TextInput
                placeholder="Поиск по названию..."
                value={titleSearchQuery}
                onChange={(event) => setTitleSearchQuery(event.currentTarget.value)}
                icon={<IconSearch size="1rem" />}
                rightSection={
                  titleSearchQuery ? (
                    <ActionIcon onClick={() => setTitleSearchQuery("")} title="Очистить поиск">
                      <IconX size="1rem" />
                    </ActionIcon>
                  ) : null
                }
                style={{ flexGrow: 1, marginRight: "10px" }}
              />

              {isMobile ? (
                displayedParameters?.length > 0 && (
                  <Group>
                    <ActionIcon
                      onClick={toggleFilters}
                      variant={filtersVisible ? "filled" : "default"}
                    >
                      <IconFilter size="1rem" />
                    </ActionIcon>
                    {Object.keys(filters).length > 0 && (
                      <ActionIcon onClick={clearFilters} variant={"default"}>
                        <IconFilterOff size="1rem" />
                      </ActionIcon>
                    )}
                  </Group>
                )
              ) : (
                <Group>
                  <SegmentedControl
                    value={blockInstanceSortType}
                    onChange={(value) => setBlockInstanceSortType(value as BlockInstanceSortType)}
                    data={[
                      {
                        value: "date",
                        label: <IconCalendar size="1rem" />,
                        title: "Сортировка по дате",
                      },
                      {
                        value: "title",
                        label: <IconSortAZ size="1rem" />,
                        title: "Сортировка по алфавиту",
                      },
                    ]}
                  />
                  {displayedParameters?.length > 0 && (
                    <>
                      <ActionIcon
                        onClick={toggleFilters}
                        variant={filtersVisible ? "filled" : "default"}
                      >
                        <IconFilter size="1rem" />
                      </ActionIcon>
                      {Object.keys(filters).length > 0 && (
                        <ActionIcon onClick={clearFilters} variant={"default"}>
                          <IconFilterOff size="1rem" />
                        </ActionIcon>
                      )}
                    </>
                  )}
                </Group>
              )}
            </Group>

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

            <Modal
              opened={opened}
              onClose={close}
              fullScreen={isMobile}
              title={"Создание " + block?.titleForms?.genitive}
              centered
            >
              <TextInput
                label="Название"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.currentTarget.value)}
                placeholder="Введите название"
                mb="md"
              />
              <TextInput
                label="Краткое описание"
                value={newShortDescription}
                onChange={(e) => setNewShortDescription(e.currentTarget.value)}
                placeholder="Введите краткое описание (необязательно)"
                mb="md"
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={close}>
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateInstance}
                  loading={addingInstance}
                  disabled={!newInstanceName.trim()}
                >
                  Создать
                </Button>
              </Group>
            </Modal>

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
              <Modal
                opened={!!movingInstanceUuid}
                onClose={() => setMovingInstanceUuid(null)}
                title="Переместить экземпляр"
                fullScreen={isMobile}
              >
                <Select
                  label="Группа"
                  data={[
                    { value: "none", label: "Без групп" },
                    ...(groups || []).map((g) => ({ value: g.uuid!, label: g.title })),
                  ]}
                  value={selectedMoveGroup}
                  onChange={(v) => setSelectedMoveGroup(v!)}
                />
                <Button fullWidth mt="md" onClick={handleConfirmMove}>
                  Переместить
                </Button>
              </Modal>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};
