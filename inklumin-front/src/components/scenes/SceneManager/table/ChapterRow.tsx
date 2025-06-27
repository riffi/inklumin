import React, { useCallback } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconFolder,
  IconFolderOpen,
  IconNote,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Box,
  Collapse,
  Divider,
  Menu,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IChapter, ISceneWithInstances } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { EditChapterModal } from "../modals/EditChapterModal";
import { SceneRow } from "./SceneRow";
import {SceneService} from "@/services/sceneService";
import {notifications} from "@mantine/notifications";

interface ChapterRowProps {
  chapter: IChapter;
  scenes: ISceneWithInstances[];
  chapters: IChapter[];
  onAddScene: (chapterId: number) => void;
  openScene: (sceneId: number, chapter?: IChapter) => void;
  selectedSceneId?: number;
  mode?: "manager" | "split";
  chapterOnly?: boolean;
}

const ChapterRowComponent = ({
  chapter,
  scenes,
  onAddScene,
  openScene,
  selectedSceneId,
  mode,
  chapters,
  chapterOnly,
}: ChapterRowProps) => {
  const isMobile = useMedia();
  const theme = useMantineTheme();
  const isCollapsed = useBookStore(
      React.useCallback(
          (state) => state.collapsedChapters.get(chapter.id) ?? false,
          [chapter.id] // зависимость только от ID главы
      )
  );

  // Получаем функцию toggleChapterCollapse один раз
  const toggleChapterCollapse = useBookStore((state) => state.toggleChapterCollapse);

  // Мемоизируем обработчик клика
  const handleToggleCollapse = useCallback(() => {
    toggleChapterCollapse(chapter.id);
  }, [chapter.id]);

  const isExpanded = !isCollapsed;
  const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);

  const deleteChapter = useCallback(async (chapterId: number) => {
    const result = await SceneService.deleteChapter(chapterId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Глава удалена", color: "green" });
      return true;
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось удалить главу", color: "red" });
      return false;
    }
  }, []);

  const updateChapter = useCallback(async (chapterId: number, title: string) => {
    const result = await SceneService.updateChapter(chapterId, title);
    if (result.success) {
      notifications.show({ title: "Успех", message: "Глава успешно обновлена", color: "green" });
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось обновить главу", color: "red" });
    }
  }, []);

  const handleDeleteChapter = useCallback(async () => {
    try {
      await deleteChapter(chapter.id);
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete chapter:", error);
    }
  }, [chapter.id]);

  const handleUpdateChapter = useCallback(
    async (newTitle: string) => {
      try {
        await updateChapter(chapter.id, newTitle);
        closeEditModal();
      } catch (error) {
        console.error("Failed to update chapter:", error);
      }
    },
    [chapter.id]
  );
  console.log("render chapter row")

  return (
    <>
      <Box
        style={{
          borderBottom: !chapterOnly ? `1px solid ${theme.colors.gray[2]}` : undefined,
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: chapterOnly ? "white" : theme.colors.gray[0],
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            borderRadius: "0"
          }}
          p={isMobile ? 'sm' : 'md'}
          onClick={() => {
            if (chapterOnly) {
              if (chapter.contentSceneId !== undefined) {
                openScene(chapter.contentSceneId, chapter);
              }
            } else {
              handleToggleCollapse(chapter.id);
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = chapterOnly
              ? theme.colors.blue[1]
              : theme.colors.gray[1];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = chapterOnly ? "white" : theme.colors.gray[0];
          }}
        >
          {!chapterOnly && (
            <ActionIcon
              variant="transparent"
              mr={isMobile ? "xs" : "sm"}
              size={isMobile ? "xs" : "sm"}
            >
              {isExpanded ? (
                <IconChevronDown size={isMobile ? 14 : 16} />
              ) : (
                <IconChevronRight size={isMobile ? 14 : 16} />
              )}
            </ActionIcon>
          )}

          <Box
            mr={isMobile ? "xs" : "sm"}
            c={chapterOnly ? theme.colors.gray[6] : theme.colors.gray[7]}
          >
            {chapterOnly ? (
              <IconNote size={isMobile ? 16 : 18} />
            ) : isExpanded ? (
              <IconFolderOpen size={isMobile ? 16 : 18} />
            ) : (
              <IconFolder size={isMobile ? 16 : 18} />
            )}
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={chapterOnly ? 400 : 600}
              size={isMobile ? "xs" : "sm"}
              c={chapterOnly ? theme.colors.dark[8] : theme.colors.dark[8]}
              style={{ lineHeight: 1.2 }}
            >
              {chapter.order ? `${chapter.order}. ` : ""}
              {chapter.title}
            </Text>
          </Box>

          <Menu withinPortal shadow="md" position="left-start">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0.7 }}
              >
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {!chapterOnly && (
                <Menu.Item
                  leftSection={<IconPlus size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddScene(chapter.id);
                  }}
                >
                  Добавить сцену
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal();
                }}
              >
                Переименовать
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal();
                }}
              >
                Удалить главу
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>

        {!chapterOnly && (
          <Collapse in={isExpanded}>
            <Stack gap={0}>
              {scenes.map((scene, index, array) => (
                <React.Fragment key={`scene-${scene.id}`}>
                  <SceneRow
                    scene={scene}
                    scenesInChapter={array}
                    openScene={openScene}
                    selectedSceneId={selectedSceneId}
                    mode={mode}
                    chapters={chapters}
                    scenes={scenes}
                    isNested={true}
                    isSelected={scene.id === selectedSceneId}
                  />
                  {index < array.length - 1 && <Divider color={theme.colors.gray[1]} />}
                </React.Fragment>
              ))}
            </Stack>
          </Collapse>
        )}
      </Box>

      <EditChapterModal
        opened={openedEditModal}
        onClose={closeEditModal}
        chapter={chapter}
        onUpdate={handleUpdateChapter}
      />

      <DeleteConfirmationModal
        opened={openedDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteChapter}
        title="Удалить главу?"
        message="Все сцены в этой главе будут перемещены в корень."
      />
    </>
  );
};

const areEqual = (prev: Readonly<ChapterRowProps>, next: Readonly<ChapterRowProps>) =>
{
  const includes = (prev.scenes?.map(scene => scene.id).includes(prev.selectedSceneId)) ||
      (next.scenes?.map(scene => scene.id).includes(next.selectedSceneId))

  const selectedSceneNotAffecting =  (
      prev.selectedSceneId === next.selectedSceneId
       || !includes
  );

  return prev.chapter === next.chapter &&
  prev.scenes === next.scenes &&
      selectedSceneNotAffecting &&
  prev.chapterOnly === next.chapterOnly;

}

export const ChapterRow = React.memo(ChapterRowComponent, areEqual);
