import React, { useCallback, useEffect, useState } from "react";
import { IconColumns, IconLayoutSidebar } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, LoadingOverlay, SegmentedControl } from "@mantine/core";
import { SceneEditor } from "@/components/scenes/SceneEditor/SceneEditor";
import { useSceneLayout } from "@/components/scenes/SceneLayout/hooks/useSceneLayout";
import { SceneManager } from "@/components/scenes/SceneManager/SceneManager";
import type { IChapter } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const SceneLayout = () => {
  const { isMobile } = useMedia();
  const navigate = useNavigate();
  const [sceneId, setSceneId] = useState<number | undefined>();
  const [chapter, setChapter] = useState<IChapter | undefined>();
  const { sceneLayoutMode, setSceneLayoutMode } = useUiSettingsStore();
  const { selectedBook } = useBookStore();
  const chapterOnlyMode = selectedBook?.chapterOnlyMode === 1;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { scenes, chapters, getScenesWithBlockInstances } = useSceneLayout();

  // Добавляем к сценам привязки к экземплярам блоков
  const scenesWithBlockInstances = useLiveQuery(
    () => getScenesWithBlockInstances(scenes),
    [scenes]
  );

  useEffect(() => {
    const isLoading = !scenes || !scenesWithBlockInstances || !chapters;
    setIsLoading(isLoading);
  }, [scenes, scenesWithBlockInstances, chapters]);

  // Автоматический выбор первой сцены при загрузке в режиме split
  useEffect(() => {
    if (
      !isLoading &&
      sceneLayoutMode === "split" &&
      !sceneId &&
      scenesWithBlockInstances?.length > 0
    ) {
      // Сортируем сцены по порядку (order) и выбираем первую
      if (scenesWithBlockInstances.length > 0 && scenesWithBlockInstances[0].id) {
        const firstScene = scenesWithBlockInstances[0];
        const sceneChapter = chapters?.find((c) => c.id === firstScene.chapterId);
        setSceneId(firstScene.id);
        if (sceneChapter) {
          setChapter(sceneChapter);
        }
      }
    }
  }, [isLoading, sceneLayoutMode, sceneId, scenesWithBlockInstances, chapters]);

  const openScene = useCallback(
    (sceneId: number, chapterParam?: IChapter) => {
      if (isMobile) {
        navigate(`/scene/card?id=${sceneId}`);
      } else {
        const currentMode = useUiSettingsStore.getState().sceneLayoutMode;
        if (currentMode === "manager") {
          navigate(`/scene/card?id=${sceneId}`);
        } else {
          setSceneId(sceneId);
          setChapter(chapterParam);
        }
      }
    },
    [isMobile, navigate]
  );

  const handleModeChange = useCallback(
    (value: string) => {
      setSceneLayoutMode(value as "manager" | "split");
    },
    [setSceneLayoutMode]
  );

  const segmentedControlData = [
    {
      label: (
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconLayoutSidebar size={18} />
        </Box>
      ),
      value: "split",
    },
    {
      label: (
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconColumns size={18} />
        </Box>
      ),
      value: "manager",
    },
  ];

  if (isMobile) {
    return (
      <SceneManager
        openScene={openScene}
        mode="manager"
        scenes={scenesWithBlockInstances}
        chapters={chapters}
        chapterOnly={chapterOnlyMode}
      />
    );
  }

  return (
    <Container fluid={sceneLayoutMode === "split"}>
      <Box display="flex">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue", type: "bars" }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <SegmentedControl
          value={sceneLayoutMode}
          onChange={handleModeChange}
          data={segmentedControlData}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 99,
          }}
          styles={{
            root: { height: 36 },
            label: {
              padding: "0 12px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />

        <Box
          style={{
            width: sceneLayoutMode === "split" ? "500px" : undefined,
            flexShrink: sceneLayoutMode === "split" ? 0 : undefined,
            position: "relative",
            flex: "auto",
            flexGrow: sceneLayoutMode === "split" ? "0" : undefined,
          }}
        >
          <Box
            style={{
              maxHeight: "calc(100vh - 50px)",
              overflowY: "auto",
            }}
          >
            <SceneManager
              openScene={openScene}
              selectedSceneId={sceneId}
              mode={sceneLayoutMode}
              scenes={scenesWithBlockInstances}
              chapters={chapters}
              chapterOnly={chapterOnlyMode}
            />
          </Box>
        </Box>

        {sceneLayoutMode === "split" && (
          <Box
            style={{
              flexGrow: 1,
              flex: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {sceneId ? <SceneEditor sceneId={sceneId} chapter={chapter} /> : <Placeholder />}
          </Box>
        )}
      </Box>
    </Container>
  );
};

const Placeholder = () => (
  <Box
    display="flex"
    style={{
      height: "100dvh",
      alignItems: "center",
      justifyContent: "center",
      color: "#999",
    }}
  >
    Выберите сцену для редактирования
  </Box>
);
