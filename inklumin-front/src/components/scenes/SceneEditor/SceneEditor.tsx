import { useCallback, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { Box, LoadingOverlay } from "@mantine/core";
import { useSceneEditor } from "@/components/scenes/SceneEditor/hooks/useSceneEditor";
import { SceneDesktopContent } from "@/components/scenes/SceneEditor/parts/SceneDesktopContent";
import { SceneMobileContent } from "@/components/scenes/SceneEditor/parts/SceneMobileContent";
import { bookDb } from "@/entities/bookDb";
import type { IChapter } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { ChapterRepository } from "@/repository/Scene/ChapterRepository";
import { SceneRepository } from "@/repository/Scene/SceneRepository";
import { BlockInstanceAiFiller } from "./parts/BlockInstanceAiFiller";
import { SceneAnalysisDrawer } from "./parts/SceneAnalysisDrawer";
import type { SceneEditorProps } from "./types";

// Extracted custom hook
const useSceneEditorState = () => {
  const [sceneBody, setSceneBody] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);

  const toggleFocusMode = useCallback(() => setFocusMode((prev) => !prev), []);
  const openBlockInstanceAiFiller = useCallback(() => setIsDrawerOpen(true), []);
  const openAnalysisDrawer = useCallback(() => setIsAnalysisDrawerOpen(true), []);
  const closeBlockInstanceAiFiller = useCallback(() => setIsDrawerOpen(false), []);
  const closeAnalysisDrawer = useCallback(() => setIsAnalysisDrawerOpen(false), []);

  return {
    sceneBody,
    setSceneBody,
    focusMode,
    toggleFocusMode,
    isDrawerOpen,
    openBlockInstanceAiFiller,
    closeBlockInstanceAiFiller,
    isAnalysisDrawerOpen,
    openAnalysisDrawer,
    closeAnalysisDrawer,
  };
};

// Extracted constants
const FOCUS_MODE_SHORTCUTS = {
  keys: ["F", "А"], // English and Russian F
  requireShift: true,
  requireModifier: true,
};

// Extracted function
const cleanTextForWordCount = (text: string): string => {
  return text
    .replace(/\u200B/g, "") // zero-width space
    .replace(/\u00A0/g, " ") // non-breaking space → обычный пробел
    .replace(/\s+$/g, "") // обрезать пробелы в конце
    .replace(/\r?\n/g, ""); // не считать переводы строк
};

export const SceneEditor = ({ sceneId, chapter }: SceneEditorProps) => {
  const navigate = useNavigate();
  const { isMobile } = useMedia();
  const { scene, saveScene } = useSceneEditor(sceneId);
  const editorState = useSceneEditorState();

  const chapterData = useLiveQuery<IChapter | undefined>(() => {
    const id = chapter?.id ?? scene?.chapterId;
    return id ? ChapterRepository.getById(bookDb, id) : undefined;
  }, [chapter?.id, scene?.chapterId]);

  const blocks = useLiveQuery<IBlock[]>(() => BlockRepository.getAll(bookDb), []);

  const handleChapterTitleChange = useCallback(
    (title: string) => {
      if (chapterData?.id) {
        ChapterRepository.update(bookDb, chapterData.id, { title });
      }
    },
    [chapterData?.id]
  );

  //@TODO нужно понять как сохранять количество символов без перерисовки всего
  const handleContentChange = useCallback(
    (contentHTML: string, contentText: string) => {
      if (!scene?.id || contentHTML === scene.body) return;

      const cleanedText = cleanTextForWordCount(contentText);
      const updatedScene = {
        ...scene,
        body: contentHTML,
        totalSymbolCountWithSpaces: cleanedText.length,
        totalSymbolCountWoSpaces: contentText.replace(/\s+/g, "").length,
      };

      SceneRepository.updateBody(bookDb, sceneId, contentHTML);
    },
    [scene, saveScene, editorState.setSceneBody]
  );

  // Global keyboard shortcut for focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTargetKey = FOCUS_MODE_SHORTCUTS.keys.includes(event.key);
      const hasRequiredModifiers = event.shiftKey && (event.ctrlKey || event.metaKey);

      if (isTargetKey && hasRequiredModifiers) {
        event.preventDefault();
        editorState.toggleFocusMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editorState.toggleFocusMode]);

  useEffect(() => {
    if (scene?.body !== undefined && scene.body !== editorState.sceneBody) {
      editorState.setSceneBody(scene.body);
    }
  }, [sceneId, scene?.id, scene?.body, editorState.sceneBody, editorState.setSceneBody]);

  if (!scene?.id) return null;

  if (scene?.id !== sceneId) {
    return (
      <Box pos="relative" style={{ minHeight: "100dvh" }}>
        <LoadingOverlay visible={true} overlayBlur={2} />
      </Box>
    );
  }

  const commonProps = {
    chapter: chapterData,
    onChapterTitleChange: handleChapterTitleChange,
    sceneBody: editorState.sceneBody,
    handleContentChange,
    scene,
    saveScene,
    focusMode: editorState.focusMode,
    toggleFocusMode: editorState.toggleFocusMode,
    openBlockInstanceAiFiller: editorState.openBlockInstanceAiFiller,
    openAnalysisDrawer: editorState.openAnalysisDrawer,
  };

  return (
    <Box>
      {isMobile ? (
        <SceneMobileContent {...commonProps} />
      ) : (
        <SceneDesktopContent {...commonProps} navigate={navigate} />
      )}

      <BlockInstanceAiFiller
        isOpen={editorState.isDrawerOpen}
        onClose={editorState.closeBlockInstanceAiFiller}
        blocks={blocks}
        sceneId={scene.id}
        sceneBody={scene?.body}
      />

      <SceneAnalysisDrawer
        isOpen={editorState.isAnalysisDrawerOpen}
        onClose={editorState.closeAnalysisDrawer}
        sceneBody={scene?.body}
      />
    </Box>
  );
};
