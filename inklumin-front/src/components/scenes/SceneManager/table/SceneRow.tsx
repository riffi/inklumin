// src/components/scenes/SceneManager/SceneRow.tsx
import React from "react";
import {
  IconArrowDown,
  IconArrowRightCircle,
  IconArrowUp,
  IconDotsVertical,
  IconNote,
  IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Badge, Box, Group, Menu, Stack, Text, useMantineTheme } from "@mantine/core";
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
  isNested?: boolean;
  isSelected?: boolean;
}

const SceneRowComponent = ({
  scene,
  scenesInChapter,
  openScene,
  selectedSceneId,
  scenes,
  chapters,
  mode,
  isNested = false,
}: SceneRowProps) => {
  const theme = useMantineTheme();
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [openedMoveModal, { open: openMoveModal, close: closeMoveModal }] = useDisclosure(false);
  const { reorderScenes, deleteScene } = useScenes(scenes);
  const currentIndex = scenesInChapter.findIndex((s) => s.id === scene.id);
  const { hovered, ref } = useHover();
  const { isMobile } = useMedia();

  const isSelected = selectedSceneId === scene.id;

  console.log("render SceneRowComponent");

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
      <Box
        ref={ref}
        onClick={handleClick}
        style={{
          padding: isNested
            ? isMobile
              ? "8px 12px 8px 12px"
              : "10px 12px 10px 16px"
            : isMobile
              ? "8px 12px"
              : "10px 16px",
          cursor: "pointer",
          backgroundColor: isSelected
            ? theme.colors.blue[0]
            : hovered
              ? theme.colors.gray[0]
              : "transparent",
          transition: "background-color 0.15s ease",
          borderLeft: isSelected ? `3px solid ${theme.colors.blue[5]}` : "3px solid transparent",
        }}
      >
        <Group gap="sm" justify="space-between" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="sm" mb={4}>
              <Box c={isSelected ? theme.colors.blue[7] : theme.colors.gray[6]}>
                <IconNote size={isMobile ? 14 : 16} />
              </Box>
              <Text
                fw={isSelected ? 500 : 400}
                size={isMobile ? "xs" : "sm"}
                c={isSelected ? theme.colors.blue[8] : theme.colors.dark[7]}
                style={{ lineHeight: 1.2 }}
              >
                {scene.order ? `${scene.order}. ` : ""}
                {scene.title}
              </Text>
            </Group>

            {mode === "manager" && (
              <Stack gap={isMobile ? 2 : 3} ml={isMobile ? 18 : 22}>
                {scene?.blockInstances.map((sceneWithInstancesBlock) => (
                  <Group key={`block-${sceneWithInstancesBlock.block.id}`} gap={6} wrap="wrap">
                    <Group gap={4}>
                      <IconViewer
                        icon={sceneWithInstancesBlock.block.icon}
                        size={12}
                        color={theme.colors.gray[6]}
                        backgroundColor="transparent"
                      />
                      <Text size="xs" c="dimmed">
                        {sceneWithInstancesBlock.block.titleForms?.plural}:
                      </Text>
                    </Group>
                    <Group gap={isMobile ? 2 : 4}>
                      {sceneWithInstancesBlock.instances.map((instance) => (
                        <Badge
                          key={`instance-${instance.id}`}
                          size={isMobile ? "xs" : "xs"}
                          variant="light"
                          color="gray"
                          styles={{
                            root: { padding: isMobile ? "0 4px" : undefined },
                            label: { fontSize: isMobile ? "9px" : undefined },
                          }}
                        >
                          {instance.title.length > (isMobile ? 15 : 15)
                            ? `${instance.title.slice(0, isMobile ? 15 : 15)}…`
                            : instance.title}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                ))}

                {scene.totalSymbolCountWithSpaces > 0 && (
                  <Text size="xs" c="dimmed" ml={0}>
                    Символов: {scene.totalSymbolCountWithSpaces?.toLocaleString()}
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          <Menu withinPortal shadow="md" position="left-start">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                style={{
                  opacity: hovered || isMobile ? 1 : 0.3,
                  transition: "opacity 0.15s ease",
                }}
              >
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconArrowUp size={14} />}
                disabled={currentIndex <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp();
                }}
              >
                Переместить вверх
              </Menu.Item>
              <Menu.Item
                leftSection={<IconArrowDown size={14} />}
                disabled={currentIndex >= scenesInChapter.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown();
                }}
              >
                Переместить вниз
              </Menu.Item>
              <Menu.Item
                leftSection={<IconArrowRightCircle size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openMoveModal();
                }}
              >
                Переместить в главу
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
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
      </Box>

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

const rowEqual = (prev: Readonly<SceneRowProps>, next: Readonly<SceneRowProps>) =>
  prev.scene === next.scene &&
  prev.isSelected === next.isSelected &&
  prev.mode === next.mode &&
  prev.isNested === next.isNested;

export const SceneRow = React.memo(SceneRowComponent, rowEqual);
