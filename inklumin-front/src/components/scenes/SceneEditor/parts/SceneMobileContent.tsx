import { useRef, useState } from "react";
import { IconDatabaseSmile, IconLink, IconReportAnalytics } from "@tabler/icons-react";
import { ActionIcon, Box, Container, Flex, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useKeyboardHeight } from "@/components/scenes/SceneEditor/hooks/useKeyboardHeight";
import { SceneLinkManager } from "@/components/scenes/SceneEditor/parts/SceneLinkManager/SceneLinkManager";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { RichEditor } from "@/components/shared/RichEditor/RichEditor";
import { IChapter, IScene } from "@/entities/BookEntities";
import { useBookStore } from "@/stores/bookStore/bookStore";

interface SceneMobileContentProps {
  sceneBody: string;
  handleContentChange: (contentHTML: string, contentText: string) => void;
  scene: IScene;
  saveScene: (dataToSave: IScene, silent: boolean) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
  openBlockInstanceAiFiller: () => void;
  openAnalysisDrawer: () => void;
  chapter?: IChapter;
  onChapterTitleChange?: (title: string) => void;
}

export const SceneMobileContent = ({
  sceneBody,
  handleContentChange,
  scene,
  saveScene,
  focusMode,
  toggleFocusMode,
  openBlockInstanceAiFiller,
  openAnalysisDrawer,
  chapter,
  onChapterTitleChange,
}: SceneMobileContentProps) => {
  const [linkManagerOpened, { open: openLinkManager, close: closeLinkManager }] =
    useDisclosure(false);
  const keyboardHeight = useKeyboardHeight(true);
  const chapterOnlyMode = useBookStore((state) => state.selectedBook?.chapterOnlyMode === 1);
  const useChecker = useBookStore((state) => state.selectedBook?.useSimplePunctuationChecker === 1);
  const warningsPanelRef = useRef<HTMLDivElement | null>(null);
  const [hasWarnings, setHasWarnings] = useState(false);

  // Элемент панели управления сценой
  const managementPanel = (
    <Group display="flex" align="center" style={{ flexGrow: 1, paddingLeft: "10px" }}>
      <Box flex={1} flexGrow={1}>
        <InlineEdit2
          value={chapterOnlyMode ? (chapter?.title ?? scene.title) : scene.title}
          onChange={(title) => {
            if (chapterOnlyMode && chapter && onChapterTitleChange) {
              onChapterTitleChange(title);
            } else {
              saveScene({ ...scene, title });
            }
          }}
          label=""
        />
      </Box>
      <ActionIcon
        variant="outline"
        onClick={openLinkManager}
        style={{
          display: "flex",
          flexGrow: 0,
        }}
      >
        <IconLink size={16} />
      </ActionIcon>
      <ActionIcon
        variant="outline"
        onClick={openBlockInstanceAiFiller}
        style={{
          display: "flex",
          flexGrow: 0,
        }}
      >
        <IconDatabaseSmile size={16} />
      </ActionIcon>
      <ActionIcon
        variant="outline"
        onClick={openAnalysisDrawer}
        style={{
          display: "flex",
          flexGrow: 0,
        }}
      >
        <IconReportAnalytics size={16} />
      </ActionIcon>
    </Group>
  );

  return (
    <Container
      size="xl"
      p="0"
      fluid
      style={focusMode ? { paddingTop: "1rem", paddingBottom: "1rem", height: "100dvh" } : {}}
    >
      <RichEditor
        initialContent={sceneBody}
        onContentChange={handleContentChange}
        onWarningsChange={(groups) => setHasWarnings(groups.length > 0)}
        mobileConstraints={
          focusMode
            ? { top: 0, bottom: 0 }
            : {
                top: 0,
                bottom: hasWarnings ? 130 : 80,
              }
        }
        focusMode={focusMode}
        toggleFocusMode={toggleFocusMode}
        warningsPanelContainer={warningsPanelRef.current}
        useIndent
        useSimplePunctuationChecker={useChecker}
      />
      {!focusMode && (
        <Flex
          justify="stretch"
          align="stretch"
          direction="column"
          wrap="wrap"
          style={{ height: "calc(100dvh - 80px)" }}
        >
          <Box
            ref={warningsPanelRef}
            style={{
              bottom: keyboardHeight > 0 ? -1000 : 0,
            }}
          />
          <Box
            style={{
              position: "fixed",
              bottom: 30 + keyboardHeight,
              left: 0,
              right: 0,
              height: 50,
              padding: "8px",
              backgroundColor: "white",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              zIndex: 150,
            }}
          >
            {managementPanel}
          </Box>
          <Box
            style={{
              position: "fixed",
              bottom: keyboardHeight,
              height: "30px",
              width: "100%",
              backgroundColor: "#f8f9fa",
              border: "1px solid #f1f1f1",
              color: "#787878",
              padding: "8px 16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              zIndex: 150,
            }}
          >
            <Text size="sm">
              Символов: {scene?.totalSymbolCountWoSpaces} / {scene?.totalSymbolCountWithSpaces}
            </Text>
          </Box>
        </Flex>
      )}
      {!focusMode && (
        <SceneLinkManager
          sceneId={scene.id!}
          opened={linkManagerOpened}
          onClose={closeLinkManager}
        />
      )}
    </Container>
  );
};
