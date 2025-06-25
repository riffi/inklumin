import { IconDatabaseSmile, IconLink, IconReportAnalytics } from "@tabler/icons-react";
import { ActionIcon, Box, Container, Flex, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useKeyboardHeight } from "@/components/scenes/SceneEditor/hooks/useKeyboardHeight";
import { SceneLinkManager } from "@/components/scenes/SceneEditor/parts/SceneLinkManager/SceneLinkManager";
import { WarningsPanel } from "@/components/scenes/SceneEditor/parts/WarningsPanel/WarningsPanel";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { RichEditor } from "@/components/shared/RichEditor/RichEditor";
import type { IWarningGroup } from "@/components/shared/RichEditor/types";
import { IChapter, IScene } from "@/entities/BookEntities";

interface SceneMobileContentProps {
  sceneBody: string;
  handleContentChange: (contentHTML: string, contentText: string) => void;
  warningGroups: IWarningGroup[];
  setWarningGroups: (warningGroups: IWarningGroup[]) => void;
  selectedGroup?: IWarningGroup;
  setSelectedGroup: (group?: IWarningGroup) => void;
  scene: IScene;
  saveScene: (dataToSave: IScene, silent: boolean) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
  openKnowledgeBaseDrawer: () => void;
  openAnalysisDrawer: () => void;
  chapter?: IChapter;
  onChapterTitleChange?: (title: string) => void;
}

export const SceneMobileContent = ({
  sceneBody,
  handleContentChange,
  warningGroups,
  setWarningGroups,
  selectedGroup,
  setSelectedGroup,
  scene,
  saveScene,
  focusMode,
  toggleFocusMode,
  openKnowledgeBaseDrawer,
  openAnalysisDrawer,
  chapter,
  onChapterTitleChange,
}: SceneMobileContentProps) => {
  const [linkManagerOpened, { open: openLinkManager, close: closeLinkManager }] =
    useDisclosure(false);
  const keyboardHeight = useKeyboardHeight(true);

  // Элемент панели управления сценой
  const managementPanel = (
    <Group display="flex" align="center" style={{ flexGrow: 1, paddingLeft: "10px" }}>
      <Box flex={1} flexGrow={1}>
        <InlineEdit2
          value={chapter ? chapter.title : scene.title}
          onChange={(title) => {
            if (chapter && onChapterTitleChange) {
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
        onClick={openKnowledgeBaseDrawer}
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
        onWarningsChange={setWarningGroups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        mobileConstraints={
          focusMode
            ? { top: 0, bottom: 0 }
            : {
                top: 0,
                bottom: warningGroups?.length > 0 && !focusMode ? 130 : 80,
              }
        }
        focusMode={focusMode}
        toggleFocusMode={toggleFocusMode}
        useIndent
      />
      {!focusMode && (
        <Flex
          justify="stretch"
          align="stretch"
          direction="column"
          wrap="wrap"
          style={{ height: "calc(100dvh - 80px)" }}
        >
          {warningGroups.length > 0 && (
            <Box flex="auto">
              <Box
                style={{
                  position: "absolute",
                  bottom: keyboardHeight > 0 ? -1000 : 0,
                  height: "130px",
                  left: 0,
                  right: 0,
                  zIndex: 200,
                  transition: "bottom 0.3s ease",
                  padding: "8px",
                  backgroundColor: "white",
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <WarningsPanel
                  warningGroups={warningGroups}
                  onSelectGroup={setSelectedGroup}
                  selectedGroup={selectedGroup}
                  displayType="iteration"
                />
              </Box>
            </Box>
          )}
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
              backgroundColor: "rgb(236,236,236)",
              color: "black",
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
