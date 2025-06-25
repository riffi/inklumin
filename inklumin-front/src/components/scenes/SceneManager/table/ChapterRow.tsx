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
import { ActionIcon, Box, Collapse, Menu, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useScenes } from "@/components/scenes/SceneManager/useScenes";
import { IChapter, IScene, ISceneWithInstances } from "@/entities/BookEntities";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { EditChapterModal } from "../modals/EditChapterModal";
import { useChapters } from "../useChapters";
import { SceneRow } from "./SceneRow";

interface ChapterRowProps {
  chapter: IChapter;
  scenes: ISceneWithInstances[];
  chapters: IChapter[];
  onAddScene: () => void;
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
  const isCollapsed = useBookStore((state) => state.collapsedChapters.get(chapter.id) ?? false);
  const toggleChapterCollapse = useBookStore((state) => state.toggleChapterCollapse);
  const isExpanded = !isCollapsed;
  const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const { deleteChapter, updateChapter } = useChapters(chapters);
  const { deleteScene } = useScenes(scenes);

  const handleDeleteChapter = useCallback(async () => {
    try {
      await deleteChapter(chapter.id);
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete chapter:", error);
    }
  }, [chapter.id, deleteChapter, closeDeleteModal]);

  const handleUpdateChapter = useCallback(
    async (newTitle: string) => {
      try {
        await updateChapter(chapter.id, newTitle);
        closeEditModal();
      } catch (error) {
        console.error("Failed to update chapter:", error);
      }
    },
    [chapter.id, updateChapter, closeEditModal]
  );

  return (
    <>
      <Table.Tr key={`chapter-${chapter.id}`}>
        <Table.Td colSpan={2} style={{ padding: 0 }}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              backgroundColor: chapterOnly ? "white" : "var(--mantine-color-gray-0)",
              cursor: "pointer",
            }}
            onClick={() => {
              if (chapterOnly) {
                if (chapter.contentSceneId !== undefined) {
                  openScene(chapter.contentSceneId, chapter);
                }
              } else {
                toggleChapterCollapse(chapter.id);
              }
            }}
          >
            {!chapterOnly && (
              <ActionIcon variant="transparent" mr="sm">
                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </ActionIcon>
            )}
            {!chapterOnly && isExpanded ? <IconFolderOpen size={18} /> : <IconNote size={18} />}
            <span
              style={{
                marginLeft: 8,
                fontWeight: chapterOnly ? 400 : 600,
                fontSize: "0.8rem",
              }}
            >
              {chapter.order ? `${chapter.order}. ` : ""} {chapter.title}
            </span>
            <Box ml="auto">
              {/* меню действий по аналогии со сценой */}
              <Menu withinPortal shadow="md" position="left-start">
                <Menu.Target>
                  <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {!chapterOnly && (
                    <Menu.Item
                      icon={<IconPlus size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddScene();
                      }}
                    >
                      Добавить сцену
                    </Menu.Item>
                  )}
                  <Menu.Item
                    icon={<IconEdit size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal();
                    }}
                  >
                    Переименовать
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconTrash size={14} />}
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
          </Box>

          {!chapterOnly && (
            <Collapse in={isExpanded}>
              <Table highlightOnHover>
                <Table.Tbody>
                  {scenes.map((scene, index, array) => (
                    <SceneRow
                      key={`scene-${scene.id}`}
                      scene={scene}
                      scenesInChapter={array}
                      openScene={openScene}
                      selectedSceneId={selectedSceneId}
                      mode={mode}
                      chapters={chapters}
                      scenes={scenes}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            </Collapse>
          )}
        </Table.Td>
      </Table.Tr>

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
  prev.chapter === next.chapter &&
  prev.scenes === next.scenes &&
  prev.selectedSceneId === next.selectedSceneId &&
  prev.mode === next.mode &&
  prev.chapterOnly === next.chapterOnly;

export const ChapterRow = React.memo(ChapterRowComponent, areEqual);
