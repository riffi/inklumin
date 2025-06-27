import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowUp,
  IconDatabaseSmile,
  IconEdit,
  IconEye,
  IconLink,
  IconMenu2,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { ActionIcon, Box, Button, Container, Flex, Group, Menu, Paper, Text } from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { useHeaderVisibility } from "@/components/scenes/SceneEditor/hooks/useHeaderVisibility";
import { SceneLinkManager } from "@/components/scenes/SceneEditor/parts/SceneLinkManager/SceneLinkManager";
import { SceneStatusPanel } from "@/components/scenes/SceneEditor/parts/SceneStatusPanel";
import { InlineEdit } from "@/components/shared/InlineEdit/InlineEdit";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { RichEditor } from "@/components/shared/RichEditor/RichEditor";
import { IChapter, IScene } from "@/entities/BookEntities";
import { useBookStore } from "@/stores/bookStore/bookStore";
import styles from "./SceneDesktopContent.module.css";

interface SceneDesktopContentProps {
  scene: IScene;
  navigate: (path: string) => void;
  saveScene: (scene: any) => void; // Замените на ваш тип
  sceneBody: string;
  handleContentChange: (contentHTML: string, contentText: string) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
  openKnowledgeBaseDrawer: () => void;
  openAnalysisDrawer: () => void;
  chapter?: IChapter;
  onChapterTitleChange?: (title: string) => void;
}

export const SceneDesktopContent = ({
  scene,
  navigate,
  saveScene,
  sceneBody,
  handleContentChange,
  focusMode,
  toggleFocusMode,
  openKnowledgeBaseDrawer,
  openAnalysisDrawer,
  chapter,
  onChapterTitleChange,
}: SceneDesktopContentProps) => {
  const { isHeaderVisible, handleEditorScroll } = useHeaderVisibility();
  const chapterOnlyMode = useBookStore((state) => state.selectedBook?.chapterOnlyMode === 1);
  const [linkManagerOpened, { open: openLinkManager, close: closeLinkManager }] =
    useDisclosure(false);
  const [readOnly, setReadOnly] = useState(true);
  const [scroll, scrollTo] = useWindowScroll();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const warningsPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const showButton = scroll.y > 300;
    setShowScrollButton(showButton);
  }, [scroll.y]);

  const scrollToTop = () => {
    scrollTo({ y: 0, x: 0 });
  };

  return (
    <Container p="0" fluid style={focusMode ? { paddingTop: "1rem", paddingBottom: "1rem" } : {}}>
      <Flex gap="md" justify="space-between" align="flex-start" wrap="wrap">
        <Box flex={focusMode ? 12 : 10} style={focusMode ? { width: "100%" } : {}}>
          <Container p="0" style={focusMode ? { maxWidth: "100%" } : {}}>
            <Paper
              withBorder={!focusMode}
              p="lg"
              shadow="sm"
              style={{
                maxWidth: focusMode ? "900px" : "900px",
                minWidth: "900px",
                height: focusMode ? "calc(100vh - 2rem)" : "calc(100vh - 65px)",
                overflowY: "auto",
                flex: 1,
                margin: focusMode ? "0 auto" : undefined,
              }}
            >
              <>
                {isHeaderVisible && !focusMode && (
                  <Group p={10} justify="space-between" align="center" w="100%">
                    <Box flex={1}>
                      <InlineEdit2
                        value={chapterOnlyMode ? (chapter?.title ?? scene.title) : scene.title}
                        size={"xl"}
                        onChange={(title) => {
                          if (chapterOnlyMode && chapter && onChapterTitleChange) {
                            onChapterTitleChange(title);
                          } else {
                            saveScene({ ...scene, title });
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Button
                        leftSection={readOnly ? <IconEdit size={14} /> : <IconEye size={14} />}
                        onClick={() => setReadOnly(!readOnly)}
                        variant={"outline"}
                      >
                        {readOnly ? "Редактирование" : "Просмотр"}
                      </Button>
                    </Box>

                    <Menu shadow="md" width={220}>
                      <Menu.Target>
                        <ActionIcon variant="outline">
                          <IconMenu2 size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconLink size={14} />} onClick={openLinkManager}>
                          Связи
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconDatabaseSmile size={14} />}
                          onClick={openKnowledgeBaseDrawer}
                        >
                          Наполнить базу знаний
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconReportAnalytics size={14} />}
                          onClick={openAnalysisDrawer}
                        >
                          Анализ
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                )}
              </>
              {(!readOnly || focusMode) && ( // Always show RichEditor in focusMode if not readOnly
                <RichEditor
                  initialContent={sceneBody}
                  onContentChange={handleContentChange}
                  onScroll={handleEditorScroll}
                  warningsPanelContainer={warningsPanelRef.current}
                  desktopConstraints={{
                    top: "-20px",
                    bottom: "0",
                  }}
                  focusMode={focusMode}
                  toggleFocusMode={toggleFocusMode}
                  useIndent
                />
              )}
              <>
                {readOnly &&
                  !focusMode && ( // Hide readOnly view in focusMode
                    <div>
                      {sceneBody !== "" && (
                        <div
                          style={{
                            textIndent: "1rem",
                            width: "100%",
                          }}
                          onDoubleClick={() => setReadOnly(false)}
                          dangerouslySetInnerHTML={{ __html: sceneBody }}
                          className={styles["readonly-content"]}
                        />
                      )}
                      {sceneBody === "" && (
                        <div
                          style={{
                            textIndent: "1rem",
                          }}
                        >
                          <Text color="dimmed" onClick={() => setReadOnly(!readOnly)}>
                            Нет текста
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
              </>
            </Paper>
            {!focusMode && <SceneStatusPanel scene={scene} />}
          </Container>
        </Box>
        {!focusMode && (
          <Box flex={2} style={{ position: "sticky", top: 16, minWidth: '200px' }} ref={warningsPanelRef} />
        )}
      </Flex>
      {!focusMode && (
        <SceneLinkManager
          sceneId={scene.id!}
          opened={linkManagerOpened}
          onClose={closeLinkManager}
        />
      )}
      {showScrollButton && !focusMode && (
        <ActionIcon
          onClick={scrollToTop}
          variant="filled"
          color="blue"
          radius="xl"
          size="xl"
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: 40,
            right: 20,
            opacity: 0.5,
            transition: "opacity 0.3s ease-in-out",
            ":hover": {
              opacity: 1,
              backgroundColor: "#1e73be",
            },
          }}
        >
          <IconArrowUp size={20} />
        </ActionIcon>
      )}
    </Container>
  );
};
