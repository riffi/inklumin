import React, { useCallback } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Center, Group, LoadingOverlay, Paper, Stack, Text } from "@mantine/core";
import { IChapter, ISceneWithInstances } from "@/entities/BookEntities";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { ChapterRow } from "./ChapterRow";
import { SceneRow } from "./SceneRow";

interface SceneTableProps {
  onAddScene: (chapterId: number) => void;
  openScene: (sceneId: number, chapter?: IChapter) => void;
  selectedSceneId?: number;
  mode?: "manager" | "split";
  scenes?: ISceneWithInstances[];
  chapters?: IChapter[];
  searchQuery?: string;
  selectedInstanceUuid?: string | null;
  chapterOnly?: boolean;
}
const EMPTY_SCENES: ISceneWithInstances[] = [];

const SceneTableComponent = ({
  onAddScene,
  openScene,
  selectedSceneId,
  mode,
  scenes,
  chapters,
  searchQuery,
  selectedInstanceUuid,
  chapterOnly,
}: SceneTableProps) => {
  // Отфильтрованные сцены мемоизируются, чтобы избежать лишних вычислений
  const filteredScenes = React.useMemo(() => {
    if (!scenes) return [] as ISceneWithInstances[];
    return scenes.filter((scene) => {
      if (!searchQuery && !selectedInstanceUuid) {
        return true;
      }
      const matchesSearch =
        scene.title.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
        chapters
          ?.find((c) => c.id === scene.chapterId)
          ?.title.toLowerCase()
          .includes(searchQuery?.toLowerCase() || "");

      const matchesInstance =
        !selectedInstanceUuid ||
        scene.blockInstances.some((bi) =>
          bi.instances.some((i) => i.uuid === selectedInstanceUuid)
        );

      return matchesSearch && matchesInstance;
    });
  }, [scenes, chapters, searchQuery, selectedInstanceUuid]);

  // Отфильтрованные главы также мемоизируются
  const filteredChapters = React.useMemo(() => {
    if (!chapters) return [] as IChapter[];
    if (chapterOnly) {
      return chapters.filter(
        (chapter) =>
          !searchQuery || chapter.title.toLowerCase().includes(searchQuery?.toLowerCase() || "")
      );
    }
    return chapters.filter((chapter) => {
      if (!searchQuery && !selectedInstanceUuid) {
        return true;
      }
      const hasScenes = filteredScenes.some((scene) => scene.chapterId === chapter.id);
      return hasScenes;
    });
  }, [chapters, filteredScenes, searchQuery, selectedInstanceUuid, chapterOnly]);

  //const collapsedChapters = useBookStore((s) => s.collapsedChapters);

  // Мемоизированная мапа сцен по главам
  const scenesByChapterId = React.useMemo(() => {
    const map = new Map<number | null, ISceneWithInstances[]>();
    for (const scene of filteredScenes) {
      const key = scene.chapterId ?? null;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(scene);
    }
    return map;
  }, [filteredScenes]);

  // Мемoизированная функция для получения сцен по главе
  const getScenesForChapter = React.useCallback(
    (chapterId: number | null) => {
      return scenesByChapterId.get(chapterId) || EMPTY_SCENES;
    },
    [scenesByChapterId] // Зависимость от мемоизированной мапы
  );

  // 1. Создаём ОДНУ стабильную функцию-обработчик
  const handleAddScene = useCallback(
    (chapterId: number) => {
      onAddScene(chapterId);
    },
    [onAddScene]
  ); // Зависимость от внешней функции

  if (!scenes || !chapters)
    return (
      <LoadingOverlay
        zIndex={1000}
        visible={true}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "blue", type: "bars" }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />
    );

  if (!scenes?.length && !chapters?.length) {
    return (
      <Paper withBorder p="lg" radius="md" shadow="sm">
        <Center mih={120}>
          <Group gap="xs" c="dimmed">
            <IconPlus size={18} />
            <Text size="sm">Добавьте первую сцену или главу</Text>
          </Group>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper style={{ overflow: "hidden" }}>
      <Stack gap={0}>
        {filteredChapters?.map((chapter) => (
          <ChapterRow
            key={`chapter-${chapter.id}`}
            chapter={chapter}
            scenes={chapterOnly ? EMPTY_SCENES : getScenesForChapter(chapter.id)}
            onAddScene={handleAddScene}
            openScene={openScene}
            selectedSceneId={selectedSceneId}
            mode={mode}
            chapters={chapters}
            chapterOnly={chapterOnly}
          />
        ))}
        {!chapterOnly &&
          getScenesForChapter(null).map((scene, index, array) => (
            <SceneRow
              key={`scene-${scene.id}`}
              scene={scene}
              scenesInChapter={array}
              openScene={openScene}
              selectedSceneId={selectedSceneId}
              mode={mode}
              scenes={scenes}
              chapters={chapters}
            />
          ))}
      </Stack>
    </Paper>
  );
};

const tableEqual = (prev: Readonly<SceneTableProps>, next: Readonly<SceneTableProps>) =>
  prev.scenes === next.scenes &&
  prev.chapters === next.chapters &&
  prev.searchQuery === next.searchQuery &&
  prev.selectedInstanceUuid === next.selectedInstanceUuid &&
  prev.selectedSceneId === next.selectedSceneId &&
  prev.mode === next.mode &&
  prev.chapterOnly === next.chapterOnly;

export const SceneTable = React.memo(SceneTableComponent, tableEqual);
