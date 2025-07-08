import React, { useCallback, useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconChartDots3Filled,
  IconEdit,
  IconInfoCircle,
  IconList,
  IconPhoto,
  IconQuestionMark,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Drawer,
  FileInput,
  Group,
  Image as MantineImage,
  Modal,
  ScrollArea,
  SegmentedControl,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useBlockInstanceEditor } from "@/components/blockInstance/BlockInstanceEditor/hooks/useBlockInstanceEditor";
import { ChildInstancesTable } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceChildrenEditor/ChildInstancesTable";
import { InstanceParameterEditor } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceParameterEditor/InstanceParameterEditor";
import { InstanceRelationsEditor } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceRelationsEditor/InstanceRelationsEditor";
import { ReferencedInstanceEditor } from "@/components/blockInstance/BlockInstanceEditor/parts/ReferencedInstanceEditor/ReferencedInstanceEditor";
import { InstanceMindMap } from "@/components/mindMap/InstanceMindMap/InstanceMindMap";
import { IconSelector } from "@/components/shared/IconSelector/IconSelector";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { InlineEdit } from "@/components/shared/InlineEdit/InlineEdit";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { UserDocViewer } from "@/components/userDoc/UserDocViewer";
import { bookDb } from "@/entities/bookDb";
import { IBlock, IBlockStructureKind, IBlockTabKind } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { UserDocRepository } from "@/repository/UserDocRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";
import { relationUtils } from "@/utils/relationUtils";
import { InstanceScenesEditor } from "./parts/InstanceScenesEditor/InstanceScenesEditor";
import classes from "./BlockInstanceEditor.module.css";

export interface IBlockInstanceEditorProps {
  blockInstanceUuid: string;
}

export const BlockInstanceEditor = (props: IBlockInstanceEditorProps) => {
  // Состояния для вкладок и активной вкладки
  const [tabs, setTabs] = useState<Array<{ label: string; value: string }>>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [iconDrawerOpen, setIconDrawerOpen] = useState(false);
  const [kbDrawerOpen, setKbDrawerOpen] = useState(false);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useMedia();
  const { selectedBook } = useBookStore();
  const { blockInstanceViewMode, setBlockInstanceViewMode } = useUiSettingsStore();

  const { setHeader } = useMobileHeader();

  const {
    blockInstance,
    block,
    updateBlockInstanceTitle,
    relatedBlocks,
    allBlocks,
    blockRelations,
    childBlocks,
    childInstancesMap,
    blockTabs,
    referencingParams,
    updateBlockInstanceShortDescription,
    updateBlockInstanceIcon,
  } = useBlockInstanceEditor(props.blockInstanceUuid);

  const userDocPage = useLiveQuery(() => {
    if (!block?.userDocPageUuid) return null;
    return UserDocRepository.getByUuid(bookDb, block.userDocPageUuid);
  }, [block?.userDocPageUuid]);

  useEffect(() => {
    if (block) {
      const actions = [] as Array<{ title: string; icon: React.ReactNode; handler: () => void }>;
      if (isMobile && block.showBigHeader === 0) {
        actions.push({
          title: "Инфо",
          icon: <IconInfoCircle size={isMobile ? "1rem" : "1.2rem"} />,
          handler: () => setInfoDrawerOpen(true),
        });
      }
      if (userDocPage) {
        actions.push({
          title: "Статья",
          icon: <IconQuestionMark size={isMobile ? "1rem" : "1.2rem"} />,
          handler: () => setKbDrawerOpen(true),
        });
      }
      setHeader({
        title: blockInstance?.title || "",
        icon: blockInstance?.icon ?? block?.icon,
        actions: actions.length > 0 ? actions : undefined,
      });
    }
    return () => setHeader(null);
  }, [block, blockInstance, userDocPage, isMobile]);

  const getTabs = () => {
    if (!blockTabs) return [{ label: "Параметры", value: "params" }];

    return blockTabs.map((tab) => {
      switch (tab.tabKind) {
        case IBlockTabKind.relation:
          return {
            label: tab.title,
            value: `related-${tab.relationUuid}`,
          };
        case IBlockTabKind.childBlock:
          return {
            label: tab.title,
            value: `child-${tab.childBlockUuid}`,
          };
        case IBlockTabKind.referencingParam:
          return {
            label: tab.title,
            value: `referencing-param-${tab.referencingParamUuid}`,
          };
        case IBlockTabKind.scenes: // Added case for scenes
          return {
            label: tab.title,
            value: "scenes", // Or a more specific unique value if tabs of this kind can be multiple
          };
        default: // parameters
          return {
            label: tab.title,
            value: "params",
          };
      }
    });
  };

  // Обновляем список вкладок и активную вкладку при изменении blockTabs
  useEffect(() => {
    const newTabs = getTabs();
    setTabs(newTabs);

    // Устанавливаем первую вкладку как активную
    if (newTabs.length > 0) {
      setActiveTab(newTabs[0].value);
    }
  }, [blockTabs]); // Зависимость от blockTabs

  const getRelatedBlockByRelationUuid = (relationUuid: string) => {
    return relationUtils.getRelatedBlockByRelationUuid(blockRelations, relatedBlocks, relationUuid);
  };

  // Удаление пользовательской иконки
  const handleRemoveIcon = async () => {
    await updateBlockInstanceIcon(undefined);

    notifications.show({
      title: "Успешно",
      message: "иконка удалена",
    });
  };

  const infoSection =
    block?.structureKind !== IBlockStructureKind.single ? (
      <Box p="sm">
        <Group>
          <Box style={{ position: "relative", width: "120px", height: "120px" }}>
            <Box
              onClick={() => setIconDrawerOpen(true)}
              style={{
                cursor: "pointer",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                display: "flex",
                width: "120px",
                height: "120px",
                justifyContent: "center",
                alignItems: "center",
                border: "2px dashed var(--mantine-color-blue-filled)",
              }}
            >
              <IconViewer
                icon={blockInstance?.icon ?? block?.icon}
                size={120}
                backgroundColor={"transparent"}
                color="var(--mantine-color-blue-filled)"
                showNoImage
              />
            </Box>
            <Group gap={4} style={{ position: "absolute", bottom: 4, right: 4 }}>
              <ActionIcon
                  variant="white"
                  size="sm"
                  onClick={() => setIconDrawerOpen(true)}
                  style={{border: '1px solid'}}
              >
                <IconEdit size="1rem" />
              </ActionIcon>
              {blockInstance?.icon && <ActionIcon
                  variant="white"
                  size="sm"
                  color="red"
                  onClick={handleRemoveIcon}
                  style={{border: '1px solid'}}
              >
                <IconTrash size="1rem" />
              </ActionIcon>}
            </Group>
          </Box>
          <Box mb="lg" style={{ flex: "1" }}>
            <InlineEdit2
              label={block?.title || ""}
              onChange={(val) => updateBlockInstanceTitle(val)}
              value={blockInstance?.title || ""}
            />
            <Space h="md" />
            <InlineEdit2
              label="Краткое описание"
              placeholder="Введите описание..."
              onChange={(val) => updateBlockInstanceShortDescription(val)}
              value={blockInstance?.description || ""}
              size="sm"
            />
          </Box>
        </Group>
      </Box>
    ) : null;

  return (
    <>
      <Container
        size="lg"
        p={"xs"}
        style={{ backgroundColor: "#FFF", minHeight: "calc(100vh - 100px)" }}
      >
        <Box className={classes.container} pos="relative">
          <Group className={classes.header}>
            <ActionIcon
              onClick={() => navigate(-1)}
              variant="subtle"
              size="lg"
              aria-label="Back to list"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <ActionIcon
              variant={blockInstanceViewMode === "data" ? "filled" : "light"}
              onClick={() => setBlockInstanceViewMode("data")}
            >
              <IconList size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => setBlockInstanceViewMode("diagram")}
              variant={blockInstanceViewMode === "diagram" ? "filled" : "light"}
            >
              <IconChartDots3Filled size={20} />
            </ActionIcon>
          </Group>
          {blockInstanceViewMode === "diagram" && <InstanceMindMap blockInstance={blockInstance} />}
          {blockInstanceViewMode === "data" && (
            <Box>
              {/* Раздел выбора иконок для экземпляра блока */}
              {!isMobile || block?.showBigHeader === 1 ? infoSection : <Space h={"sm"} />}

              <section>
                <ScrollArea
                  type="hover"
                  offsetScrollbars
                  styles={{
                    viewport: { scrollBehavior: "smooth" },
                    root: {
                      flex: 1,
                      display: tabs.length <= 1 ? "none" : "",
                    },
                  }}
                >
                  <SegmentedControl
                    value={activeTab || ""}
                    onChange={setActiveTab}
                    data={tabs}
                    style={{
                      textTransform: "Capitalize",
                      minWidth: "100%",
                      display: tabs.length <= 1 ? "none" : "",
                    }}
                  />
                </ScrollArea>
                {blockTabs?.map((tab) => {
                  const tabValue =
                    tab.tabKind === IBlockTabKind.relation
                      ? `related-${tab.relationUuid}`
                      : tab.tabKind === IBlockTabKind.childBlock
                        ? `child-${tab.childBlockUuid}`
                        : tab.tabKind === IBlockTabKind.referencingParam
                          ? `referencing-param-${tab.referencingParamUuid}`
                          : tab.tabKind === IBlockTabKind.scenes // Added condition for scenes
                            ? "scenes"
                            : "params";

                  return (
                    activeTab === tabValue && (
                      <Box key={tab.uuid}>
                        <>
                          {tab.tabKind === "parameters" && (
                            <>
                              <InstanceParameterEditor
                                blockInstanceUuid={props.blockInstanceUuid}
                                blockUseTabs={block?.useTabs === 1}
                                relatedBlocks={relatedBlocks}
                                allBlocks={allBlocks}
                                relations={blockRelations}
                              />
                            </>
                          )}
                        </>
                        <>
                          {tab.tabKind === "relation" &&
                            (() => {
                              const relatedBlock = getRelatedBlockByRelationUuid(tab.relationUuid);
                              return (
                                relatedBlock && (
                                  <InstanceRelationsEditor
                                    key={tab.uuid}
                                    blockInstanceUuid={props.blockInstanceUuid}
                                    blockUuid={block?.uuid}
                                    relatedBlock={relatedBlock}
                                    blockRelation={blockRelations?.find(
                                      (r) => r.uuid === tab.relationUuid
                                    )}
                                  />
                                )
                              );
                            })()}
                        </>
                        <>
                          {tab.tabKind === "childBlock" &&
                            childBlocks?.map(
                              (childBlock) =>
                                activeTab === `child-${childBlock.uuid}` && (
                                  <ChildInstancesTable
                                    key={childBlock.uuid}
                                    blockUuid={childBlock.uuid}
                                    blockInstanceUuid={props.blockInstanceUuid}
                                    instances={childInstancesMap?.[childBlock.uuid] || []}
                                    structureKind={childBlock.structureKind}
                                    relatedBlock={childBlock}
                                  />
                                )
                            )}
                        </>
                        <>
                          {tab.tabKind === IBlockTabKind.referencingParam &&
                            referencingParams?.map(
                              (param) =>
                                activeTab === `referencing-param-${param.uuid}` && (
                                  <ReferencedInstanceEditor
                                    block={block}
                                    referencingParam={param}
                                    instance={blockInstance}
                                  />
                                )
                            )}
                        </>
                        {/* Added condition for scenes */}
                        <>
                          {tab.tabKind === IBlockTabKind.scenes && (
                            <InstanceScenesEditor
                              blockInstanceUuid={props.blockInstanceUuid}
                              blockUuid={blockInstance?.blockUuid || ""} // Pass blockUuid
                            />
                          )}
                        </>
                      </Box>
                    )
                  );
                })}
              </section>
            </Box>
          )}
        </Box>
      </Container>

      <IconSelector
        opened={iconDrawerOpen}
        onClose={() => setIconDrawerOpen(false)}
        onSelect={(icon) => updateBlockInstanceIcon(icon)}
        initialIcon={block?.icon}
      />
      <Drawer
        opened={infoDrawerOpen}
        onClose={() => setInfoDrawerOpen(false)}
        size="xl"
        position="right"
        title="Информация"
      >
        {infoSection}
      </Drawer>
      <Drawer
        opened={kbDrawerOpen}
        onClose={() => setKbDrawerOpen(false)}
        size="xl"
        position="right"
        title={userDocPage?.title}
      >
        {userDocPage && <UserDocViewer uuid={userDocPage.uuid!} bookUuid={selectedBook?.uuid} />}
      </Drawer>
    </>
  );
};
