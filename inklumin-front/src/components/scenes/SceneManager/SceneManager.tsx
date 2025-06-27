import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IconChevronLeft,
  IconFilter,
  IconFolderOpen,
  IconFolderPlus,
  IconFolderUp,
  IconDotsVertical,
  IconNote,
  IconPlus,
  IconQuestionMark,
  IconSearch,
  IconX, IconArrowDown, IconArrowDownBar,
  IconTriangleInvertedFilled,
  IconCaretDownFilled,
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
  Menu,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure, useHotkeys, useMediaQuery } from "@mantine/hooks";
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isWide = useMediaQuery("(min-width: 85.375em)");

  useHotkeys([
    ["mod+K", () => setIsSearchVisible(true)],
  ]);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

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

  const actionPanel = <Group justify="flex-end" align="center" wrap="nowrap">
    <Text fw={700} size="sm" style={{ lineHeight: 1 }} c="gray.6" tt="uppercase">
      {props.chapterOnly ? "Главы" : "Главы и сцены"}
    </Text>

    {isWide || isSearchVisible ? (
        <TextInput
            ref={searchInputRef}
            placeholder="Поиск…"
            leftSection={<IconSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onBlur={() => !isWide && setIsSearchVisible(false)}
            style={{ flex: 1, marginLeft: 8, marginRight: 8 }}
        />
    ) : (
        <Tooltip label="Поиск (⌘+K)">
          <ActionIcon onClick={() => setIsSearchVisible(true)} aria-label="Поиск">
            <IconSearch size={16} />
          </ActionIcon>
        </Tooltip>
    )}

    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <Tooltip label="Создать">
          <ActionIcon variant="filled" color="blue" aria-label="Создать">
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={openChapterModal}>Новая глава</Menu.Item>
        {!props.chapterOnly && (
            <Menu.Item onClick={() => handleOpenCreateModal(null)}>Новая сцена</Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>

    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <Tooltip label="Ещё действия">
          <ActionIcon variant="subtle" aria-label="Меню">
            <IconCaretDownFilled size={16} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={collapseAllChapters} disabled={!props.chapters?.length}>Свернуть всё</Menu.Item>
        <Menu.Item onClick={expandAllChapters} disabled={!collapsedCount}>Развернуть всё</Menu.Item>
        <Menu.Item onClick={openFilters}>Фильтры</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  </Group>

  useEffect(() => {
    const header = (
        <Group gap="xs" justify={"space-between"}>
          {actionPanel}
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
      {!isMobile && <Box
        style={{
          position: "sticky",
          top: isMobile ? 50 : 0,
          zIndex: 50,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E0E0E0",
          minHeight: isMobile ? 40 : 48,
        }}
        p={isMobile ? 'sm' : 'md'}
      >
        {actionPanel}
      </Box>}

      <SceneTable
        onAddScene={handleOpenCreateModal}
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
