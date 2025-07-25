import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArrowUp,
  IconBook,
  IconBookmark,
  IconLibrary,
  IconList,
  IconMenu2,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Button,
  Divider,
  Loader,
  LoadingOverlay,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useScrollSpy, useWindowScroll } from "@mantine/hooks";
import { BookReaderScene } from "@/components/books/BookReader/parts/BookReaderScene";
import { useBookReader } from "@/components/books/BookReader/useBookReader";
import { bookDb } from "@/entities/bookDb";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { SceneRepository } from "@/repository/Scene/SceneRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import styles from "./BookReader.module.css";

interface TOCItem {
  type: "chapter" | "scene";
  id: number;
  order: number;
  title: string;
  children?: TOCItem[];
}

const TOCItemComponent: React.FC<{
  item: TOCItem;
  currentSceneId?: number;
  currentChapterId?: number;
  onNavigate: (id: string) => void;
  openChapters: Set<number>;
  onToggleChapter: (id: number) => void;
}> = ({ item, currentSceneId, currentChapterId, onNavigate, openChapters, onToggleChapter }) => {
  if (item.type === "chapter") {
    const isActive = item.id === currentChapterId;
    const containsCurrentScene = item.children?.some((child) => child.id === currentSceneId);
    const isOpen = openChapters.has(item.id) || containsCurrentScene;
    return (
      <NavLink
        label={`${item.order}. ${item.title}`}
        opened={isOpen}
        onClick={() => onToggleChapter(item.id)}
        leftSection={<IconLibrary size={16} color={isActive ? "#228be6" : "#495057"} />}
        className={isActive ? styles.activeItem : ""}
        fw={500}
        styles={{ root: { padding: "8px 8px" } }}
      >
        <div className={styles.tocNestedItem}>
          {item.children?.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              currentSceneId={currentSceneId}
              currentChapterId={currentChapterId}
              onNavigate={onNavigate}
              openChapters={openChapters}
              onToggleChapter={onToggleChapter}
            />
          ))}
        </div>
      </NavLink>
    );
  }

  const isActive = item.id === currentSceneId;
  return (
    <NavLink
      label={item.title}
      onClick={() => onNavigate(`scene-${item.id}`)}
      size="sm"
      className={isActive ? styles.activeItem : ""}
      leftSection={<IconBookmark size={12} color={isActive ? "#228be6" : "#868e96"} />}
      styles={{ root: { padding: "6px 8px" } }}
    />
  );
};

export const BookReader: React.FC = () => {
  const { scenes, chapters, loading, error } = useBookReader();
  const { selectedBook } = useBookStore();
  const chapterOnlyMode = selectedBook?.chapterOnlyMode === 1;
  const { active: activeSceneOrder, reinitialize: reinitializeSceneSpy } = useScrollSpy({
    selector: "[data-scene]",
    getDepth: (el) => Number(el.getAttribute("data-scene")),
    getValue: (el) => el.getAttribute("data-scene") || "",
    offset: 100,
  });
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [scroll, scrollTo] = useWindowScroll();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true);

  const currentScene =
    activeSceneOrder !== undefined ? scenes?.find((s) => s.order === activeSceneOrder + 1) : null;
  const currentChapter = chapters?.find((c) => c.id === currentScene?.chapterId);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "auto" });
    setIsTocOpen(false); // Close TOC on mobile after navigation
  }, []);

  const scrollToTop = () => {
    scrollTo({ y: 0, x: 0 });
  };

  useEffect(() => {
    reinitializeSceneSpy();
  }, [scenes, chapters]);

  useEffect(() => {
    const showButton = scroll.y > 300;
    setShowScrollButton(showButton);
  }, [scroll.y]);

  useEffect(() => {
    if (currentScene?.chapterId) {
      setOpenChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentScene.chapterId!);
        return newSet;
      });
    }
  }, [currentScene?.chapterId]);

  const toggleChapter = useCallback((chapterId: number) => {
    setOpenChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  }, []);

  const buildTOC = useMemo(() => {
    if (chapterOnlyMode) {
      return (
        chapters?.map((chapter) => ({
          type: "chapter" as const,
          id: chapter.id!,
          order: chapter.order,
          title: chapter.title,
        })) || []
      );
    }

    const chapterItems: TOCItem[] =
      chapters?.map((chapter) => ({
        type: "chapter" as const,
        id: chapter.id!,
        order: chapter.order,
        title: chapter.title,
        children: scenes
          ?.filter((s) => s.chapterId === chapter.id)
          .map((scene) => ({
            type: "scene" as const,
            id: scene.id!,
            order: scene.order,
            title: scene.title,
          })),
      })) || [];

    const standaloneScenes: TOCItem[] =
      scenes
        ?.filter((s) => !s.chapterId)
        .map((scene) => ({
          type: "scene" as const,
          id: scene.id!,
          order: scene.order,
          title: scene.title,
        })) || [];

    return [...chapterItems, ...standaloneScenes];
  }, [chapters, scenes, chapterOnlyMode]);

  const handleSceneUpdate = useCallback(async (sceneId: number, newBody: string) => {
    try {
      await SceneRepository.update(bookDb, sceneId, { body: newBody });
    } catch (err) {
      console.error("Ошибка сохранения сцены:", err);
    }
  }, []);

  return (
    <div className={styles.container}>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "blue", type: "bars" }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <div className={`${styles.tocPanel} ${isTocOpen ? styles.tocPanelOpen : ""}`}>
        <div className={styles.tocHeader}>
          <IconBook size={20} />
          <span>Содержание</span>
        </div>
        <ScrollArea>
          {buildTOC.map((item) => (
            <TOCItemComponent
              key={`${item.type}-${item.id}`}
              item={item}
              currentSceneId={currentScene?.id}
              currentChapterId={currentChapter?.id}
              onNavigate={scrollToSection}
              openChapters={openChapters}
              onToggleChapter={toggleChapter}
            />
          ))}
        </ScrollArea>
      </div>

      <div className={styles.contentPanel}>
        <div>
          {buildTOC.map((item) =>
            item.type === "chapter" ? (
              <div key={item.id}>
                <h2 className={styles.chapterTitle}>{item.title}</h2>
                {chapterOnlyMode
                  ? (() => {
                      const chapterScene = scenes?.find((s) => s.chapterId === item.id);
                      return chapterScene ? (
                        <BookReaderScene
                          key={`scene-${item.id}`}
                          scene={chapterScene}
                          isEditing={editingSceneId === chapterScene.id}
                          onEditStart={() => setEditingSceneId(chapterScene.id)}
                          onEditCancel={() => setEditingSceneId(null)}
                          onSceneUpdate={handleSceneUpdate}
                        />
                      ) : null;
                    })()
                  : item.children?.map((child) => (
                      <BookReaderScene
                        key={child.id}
                        scene={scenes.find((s) => s.id === child.id)!}
                        isEditing={editingSceneId === child.id}
                        onEditStart={() => setEditingSceneId(child.id)}
                        onEditCancel={() => setEditingSceneId(null)}
                        onSceneUpdate={handleSceneUpdate}
                      />
                    ))}
              </div>
            ) : (
              <BookReaderScene
                key={item.id}
                scene={scenes.find((s) => s.id === item.id)!}
                isEditing={editingSceneId === item.id}
                onEditStart={() => setEditingSceneId(item.id)}
                onEditCancel={() => setEditingSceneId(null)}
                onSceneUpdate={handleSceneUpdate}
              />
            )
          )}
        </div>
      </div>

      {showScrollButton && (
        <ActionIcon
          onClick={scrollToTop}
          className={styles.scrollTopButton}
          variant="filled"
          color="blue"
          radius="xl"
          size="lg"
          aria-label="Scroll to top"
        >
          <IconArrowUp size={20} />
        </ActionIcon>
      )}

      <ActionIcon
        className={styles.tocToggleButton}
        onClick={() => setIsTocOpen(!isTocOpen)}
        variant="filled"
        color="blue"
        radius="xl"
        size="lg"
        aria-label="Toggle table of contents"
      >
        <IconMenu2 size={20} />
      </ActionIcon>
    </div>
  );
};
