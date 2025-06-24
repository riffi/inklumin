// src/components/scenes/SceneManager/SceneRow.tsx
import { IconArrowDown, IconArrowRightCircle, IconArrowUp, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Box, Group, Menu, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { bookDb } from "@/entities/bookDb";
import { IChapter, ISceneWithInstances } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { SceneRepository } from "@/repository/Scene/SceneRepository";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { MoveSceneModal } from "../modals/MoveSceneModal";
import { useScenes } from "../useScenes";

interface SceneRowProps {
  scene: ISceneWithInstances;
  scenesInChapter: Array<{ id: number }>;
  openScene: (sceneId: number, chapter?: IChapter) => void;
  scenes: ISceneWithInstances[];
  chapters: IChapter[];
  selectedSceneId?: number;
  mode?: "manager" | "split";
}

export const SceneRow = ({
  scene,
  scenesInChapter,
  openScene,
  selectedSceneId,
  scenes,
  chapters,
  mode,
}: SceneRowProps) => {
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [openedMoveModal, { open: openMoveModal, close: closeMoveModal }] = useDisclosure(false);
  const { reorderScenes, deleteScene } = useScenes(scenes);
  const currentIndex = scenesInChapter.findIndex((s) => s.id === scene.id);
  const { hovered, ref } = useHover();
  const { isMobile } = useMedia();
  const theme = useMantineTheme();

  const handleMoveUp = () => {
    const prevScene = scenesInChapter[currentIndex - 1];
    if (prevScene) {
      reorderScenes(scene.id, prevScene.id);
    }
  };


  const handleMoveDown = () => {
    const nextScene = scenesInChapter[currentIndex + 1];
    if (nextScene) {
      reorderScenes(scene.id, nextScene.id);
    }
  };

  const handleDelete = () => {
    deleteScene(scene.id);
    closeDeleteModal();
  };

  const handleClick = () => {
    const chapterObj = chapters.find((c) => c.id === scene.chapterId);
    openScene(scene.id, chapterObj);
  };

  const handleMove = async (newChapterId: number | null) => {
    try {
      await SceneRepository.recalculateGlobalOrder(bookDb, {
        id: scene.id,
        newChapterId,
      });

      closeMoveModal();
      notifications.show({
        title: "Успех",
        message: "Сцена перемещена",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось переместить сцену",
        color: "red",
      });
    }
  };

    return (
        <>
            <Table.Tr
                ref={ref}
                // Выделяем выбранную сцену
                bg={selectedSceneId === scene.id ? theme.colors.blue[0] : undefined}
                onClick={handleClick}
                style={{ cursor: "pointer" }}
            >
                <Table.Td
                    colSpan={2}
                    pl={scene.chapterId ? theme.spacing.md : theme.spacing.sm}
                >
                    <Group justify="space-between" wrap="nowrap">
                        {/* ---------- title + badges ---------- */}
                        <Stack gap={2} style={{ flex: 1 }}>
                            <Text fz="sm" fw={400} c="dark.6">
                                {scene.order ? `${scene.order}. ` : ""}
                                {scene.title}
                            </Text>

                            {mode === "manager" && (
                                <>
                                <Stack gap={5} wrap="wrap">
                                    {scene?.blockInstances.map((sceneWithInstancesBlock) => (
                                        <>
                                            <Group gap={4} key={`block-${sceneWithInstancesBlock.block.id}`}
                                                   wrap="nowrap">
                                                <IconViewer
                                                    icon={sceneWithInstancesBlock.block.icon}
                                                    size={14}
                                                    color={theme.colors.gray[6]}
                                                    backgroundColor="transparent"
                                                />
                                                <Text fz={10} c="gray.6">
                                                    {sceneWithInstancesBlock.block.titleForms?.plural}:
                                                </Text>
                                                {sceneWithInstancesBlock.instances.map((instance) => (
                                                    <Text
                                                        key={`instance-${instance.id}`}
                                                        style={{
                                                            fontSize: 10,
                                                            fontWeight: 500,
                                                            backgroundColor: theme.colors.gray[5],
                                                            padding: "0 4px",
                                                            borderRadius: theme.radius.sm,
                                                            color: theme.white,
                                                        }}
                                                    >
                                                        {instance.title.length > 15
                                                            ? `${instance.title.slice(0, 12)}…`
                                                            : instance.title}
                                                    </Text>
                                                ))}
                                            </Group>
                                        </>
                                    ))}
                                </Stack>
                                <Group>
                                 <Text style={{ fontSize: 11, color: "#999" }}>
                                    Символов: {scene.totalSymbolCountWithSpaces}
                                </Text>
                                </Group>
                                </>
                            )}
                        </Stack>

                        {/* ---------- actions ---------- */}
                        <Menu withinPortal shadow="md" position="left-start">
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        opacity: hovered || isMobile ? 1 : 0,
                                        transition: "opacity .15s ease",
                                    }}
                                >
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    icon={<IconArrowUp size={14} />}
                                    disabled={currentIndex <= 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveUp();
                                    }}
                                >
                                    Переместить вверх
                                </Menu.Item>
                                <Menu.Item
                                    icon={<IconArrowDown size={14} />}
                                    disabled={currentIndex >= scenesInChapter.length - 1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveDown();
                                    }}
                                >
                                    Переместить вниз
                                </Menu.Item>
                                <Menu.Item
                                    icon={<IconArrowRightCircle size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openMoveModal();
                                    }}
                                >
                                    Переместить в главу
                                </Menu.Item>
                                <Menu.Item
                                    icon={<IconTrash size={14} />}
                                    color="red"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal();
                                    }}
                                >
                                    Удалить сцену
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Table.Td>
            </Table.Tr>

            {/* ----- MODALS ----- */}
            <DeleteConfirmationModal
                opened={openedDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Удалить сцену?"
                message="Вы уверены, что хотите удалить эту сцену?"
            />

            <MoveSceneModal
                opened={openedMoveModal}
                onClose={closeMoveModal}
                onMove={handleMove}
                currentChapterId={scene.chapterId}
            />
        </>
    );

};
