import React, { useCallback, useEffect, useState } from "react";
import {
  IconChevronLeft,
  IconFilter,
  IconFolderOpen,
  IconFolderPlus,
  IconFolderUp,
  IconNote,
  IconPlus,
  IconQuestionMark,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Container,
  Drawer,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { bookDb } from "@/entities/bookDb";
import { IChapter, ISceneWithInstances } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { usePageTitle } from "@/providers/PageTitleProvider/PageTitleProvider";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { CreateChapterModal } from "./modals/CreateChapterModal";
import { CreateSceneModal } from "./modals/CreateSceneModal";
import { SceneTable } from "./table/SceneTable";
import { useChapters } from "./useChapters";
import { useScenes } from "./useScenes";

export interface SceneManagerProps {
  openScene: (sceneId: number, chapter?: IChapter) => void;
  selectedSceneId?: number | undefined;
  mode?: "manager" | "split";
  onToggleMode?: () => void;
  scenes?: ISceneWithInstances[];
  chapters?: IChapter[];
  chapterOnly?: boolean;
}
export const SceneManager = (props: SceneManagerProps) => {
  const theme = useMantineTheme();

  const { setTitleElement } = usePageTitle();
  const [openedCreateModal, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [openedChapterModal, { open: openChapterModal, close: closeChapterModal }] =
    useDisclosure(false);
  const [chapterForNewScene, setChapterForNewScene] = useState<number | null>(null);

  const [openedFilters, { open: openFilters, close: closeFilters }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 400);
  const [selectedBlock, setSelectedBlock] = useState<IBlock | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [availableBlocks, setAvailableBlocks] = useState<IBlock[]>([]);
  const [availableInstances, setAvailableInstances] = useState<any[]>([]);

  const handleOpenCreateModal = useCallback(
    (chapterId: number | null) => {
      setChapterForNewScene(chapterId);
      openCreateModal();
    },
    [openCreateModal]
  );

  const handleOpenScene = useCallback(
    (sceneId: number, chapter?: IChapter) => {
      props.openScene(sceneId, chapter);
    },
    [props.openScene]
  );

  const handleCloseCreateModal = useCallback(() => {
    closeCreateModal();
    setChapterForNewScene(null);
  }, [closeCreateModal]);

  const navigate = useNavigate();
  const { isMobile } = useMedia();
  const collapsedCount = useBookStore((state) => state.collapsedChapters.size);
  const { createChapter } = useChapters(props.chapters);

  const { createScene } = useScenes(props.scenes);

  useEffect(() => {
    const header = (
      <Group gap="xs">
        <Text fw={500}>Сцены и главы</Text>
        <ActionIcon
          component={Link}
          to={`/knowledge-base/35683308-29ea-4e37-b3b6-1ad3fe7a9053`}
          variant="subtle"
          title="Справка"
        >
          <IconQuestionMark size="1rem" />
        </ActionIcon>
      </Group>
    );
    setTitleElement(header);
    return () => setTitleElement(null);
  }, []);

  useEffect(() => {
    const loadBlocks = async () => {
      const blocks = await BlockRepository.getAll(bookDb);
      setAvailableBlocks(blocks.filter((b) => b.showInSceneList === 1));
    };
    loadBlocks();
  }, []);

  useEffect(() => {
    const loadInstances = async () => {
      if (!selectedBlock) return;
      const instances = await BlockInstanceRepository.getBlockInstances(bookDb, selectedBlock.uuid);
      setAvailableInstances(instances);
    };
    loadInstances();
  }, [selectedBlock]);

  const handleCreateScene = async (title: string) => {
    if (!title.trim()) return;
    try {
      const newSceneId = await createScene(title, chapterForNewScene ?? undefined);
      closeCreateModal();
      setChapterForNewScene(null);
      if (isMobile) {
        navigate(`/scene/card?id=${newSceneId}`);
      } else {
        props.openScene(newSceneId);
      }
    } catch (error) {
      console.error("Failed to create scene:", error);
    }
  };

  const handleCreateChapter = async (title: string) => {
    if (!title.trim()) return;
    try {
      await createChapter(title);
      closeChapterModal();
    } catch (error) {
      console.error("Failed to create chapter:", error);
    }
  };

  const collapseAllChapters = () => {
    const chapterIds = props.chapters?.map((chapter) => chapter.id) || [];
    const store = useBookStore.getState();
    const currentCollapsed = store.collapsedChapters;

    chapterIds.forEach((id) => {
      if (!currentCollapsed.get(id)) {
        store.toggleChapterCollapse(id);
      }
    });
  };

  const expandAllChapters = () => {
    const store = useBookStore.getState();
    store.collapsedChapters.forEach((isCollapsed, id) => {
      if (isCollapsed) {
        store.toggleChapterCollapse(id);
      }
    });
  };

  return (
    <Container
      fluid={isMobile}
      p={isMobile ? "0" : "lg"}
      style={{
        position: "relative", // Добавляем для корректного позиционирования иконки
        backgroundColor: "#FFFFFF",
        borderRadius: "5px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        paddingTop: "20px",
        maxWidth: isMobile
          ? undefined
          : props.mode === "manager"
            ? "var(--container-size-md)"
            : "600px",
        width: props.mode === "manager" ? "var(--container-size-md)" : undefined,
      }}
    >
      <Box
        style={{
          position: "sticky",
          top: isMobile ? 50 : 0,
          zIndex: 50,
          backgroundColor: "#FFFFFF",
          paddingTop: isMobile ? "12px" : "16px",
          borderBottom: "1px solid #E0E0E0",
          paddingBottom: isMobile ? "6px" : "8px",
        }}
      >
        <Group
          justify="space-between"
          mb={isMobile ? "xs" : "md"}
          px="sm"
          wrap={isMobile ? "wrap" : "nowrap"}
        >
          <Title order={isMobile ? 4 : 3} visibleFrom={"sm"}>
            {props.chapterOnly ? "Главы" : "Главы и сцены"}
          </Title>
          <Group>
            <Tooltip label="Добавить главу">
              <ActionIcon onClick={openChapterModal}>
                {!props.chapterOnly && <IconFolderPlus size={16} />}
                {props.chapterOnly && <IconPlus size={16} />}
              </ActionIcon>
            </Tooltip>
            {!props.chapterOnly && (
              <>
                <Tooltip label="Добавить сцену">
                  <ActionIcon onClick={() => handleOpenCreateModal(null)}>
                    <IconNote size={16} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Свернуть все главы">
                  <ActionIcon
                    variant="subtle"
                    onClick={collapseAllChapters}
                    disabled={!props.chapters?.length}
                    size={isMobile ? "sm" : "md"}
                  >
                    <IconFolderUp size={isMobile ? 18 : 18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Развернуть все главы">
                  <ActionIcon
                    variant="subtle"
                    onClick={expandAllChapters}
                    disabled={!collapsedCount}
                    size={isMobile ? "sm" : "md"}
                  >
                    <IconFolderOpen size={isMobile ? 18 : 18} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
          <Group ml="auto" gap={8}>
            <Tooltip label="Фильтры">
              <ActionIcon variant={openedFilters ? "filled" : "subtle"} onClick={openFilters}>
                <IconFilter size={16} />
              </ActionIcon>
            </Tooltip>

            {(debouncedSearch || selectedInstance) && (
              <Tooltip label="Очистить фильтры">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBlock(null);
                    setSelectedInstance(null);
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
        <Group></Group>
      </Box>

      <SceneTable
        openCreateModal={handleOpenCreateModal}
        openScene={handleOpenScene}
        selectedSceneId={props.selectedSceneId}
        mode={props.mode}
        scenes={props.scenes}
        chapters={props.chapters}
        searchQuery={debouncedSearch}
        selectedInstanceUuid={selectedInstance}
        chapterOnly={props.chapterOnly}
      />

      <CreateSceneModal
        opened={openedCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateScene}
      />

      <CreateChapterModal
        opened={openedChapterModal}
        onClose={closeChapterModal}
        onCreate={handleCreateChapter}
      />

      <Drawer
        opened={openedFilters}
        onClose={closeFilters}
        title="Фильтры"
        position="right"
        size={isMobile ? "100%" : "400px"}
        padding="md"
      >
        <Stack>
          <Group gap="md" align="flex-end">
            <TextInput
              placeholder="Поиск по названию..."
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
          </Group>
          <Text>Поиск по базе знаний</Text>
          <Group gap="md" align="flex-end">
            <Select
              placeholder="Элемент базы знаний"
              data={availableBlocks.map((b) => ({ value: b.uuid, label: b.titleForms?.plural }))}
              value={selectedBlock ? selectedBlock?.uuid : ""}
              onChange={(uuid) => setSelectedBlock(availableBlocks.find((b) => b.uuid === uuid))}
              clearable
            />

            <Select
              placeholder={selectedBlock ? selectedBlock?.title : ""}
              data={availableInstances.map((i) => ({ value: i.uuid, label: i.title }))}
              value={selectedInstance}
              onChange={setSelectedInstance}
              disabled={!selectedBlock}
              clearable
            />
          </Group>
        </Stack>
      </Drawer>
    </Container>
  );
};
