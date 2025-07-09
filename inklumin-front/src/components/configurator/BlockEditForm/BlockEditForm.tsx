// BlockEditForm.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  Container,
  Group,
  ScrollArea,
  SegmentedControl,
  Space,
} from "@mantine/core";
import { BlockTabsManager } from "@/components/configurator/BlockEditForm/parts/BlockTabsManager/BlockTabsManager";
import { NestedBlocksManager } from "@/components/configurator/BlockEditForm/parts/NestedBlocksManager/NestedBlocksManager";
import { MainTabContent } from "@/components/configurator/BlockEditForm/parts/MainTabContent/MainTabContent";
import { ParamManager } from "@/components/configurator/BlockEditForm/parts/ParamManager/ParamManager";
import { RelationManager } from "@/components/configurator/BlockEditForm/parts/RelationManager/RelationManager";
import { useBlockEditForm } from "@/components/configurator/BlockEditForm/useBlockEditForm";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { getBlockTitle } from "@/utils/configUtils";
import { BlockEditTab, blockEditTabOptions } from "./BlockEditTabs";
import classes from "./BlockEditForm.module.css";

interface IBlockEditFormProps {
  blockUuid: string;
  bookUuid?: string;
}

export const BlockEditForm = ({ blockUuid, bookUuid }: IBlockEditFormProps) => {
  const { isMobile } = useMedia();
  const { setHeader } = useMobileHeader();
  const [activeTab, setActiveTab] = useState<BlockEditTab>(BlockEditTab.main);
  const handleTabChange = useCallback((value: string) => setActiveTab(value as BlockEditTab), []);

  const { saveBlock, configuration, block, otherBlocks, blockRelations } = useBlockEditForm(
    blockUuid,
    bookUuid
  );

  useEffect(() => {
    setHeader({
      title: getBlockTitle(block),
    });
  }, [blockUuid, block]);

  const breadCrumbs = useMemo(
    () =>
      [
        { title: "Конфигуратор", href: "/configurator" },
        {
          title: configuration?.title,
          href: `/configuration/edit?uuid=${configuration?.uuid}`,
        },
        { title: block?.title, href: "#" },
      ].map((item, index) => (
        <Anchor href={item.href} key={index}>
          {item.title}
        </Anchor>
      )),
    [configuration?.title, configuration?.uuid, block?.title]
  );

  if (!block) {
    return (
      <Container>
        <p>Загрузка данных блока...</p>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md" className={classes.container}>
      {!isMobile && (
        <>
          <h1>Блок: {block?.title}</h1>
          <Breadcrumbs separator="→" separatorMargin="md" mt="xs">
            {breadCrumbs}
          </Breadcrumbs>
          <Space h="md" />
        </>
      )}

      <Group mb="md" pos="relative" style={{ overflow: "visible" }}>
        <ScrollArea
          type="hover"
          offsetScrollbars
          styles={{
            viewport: { scrollBehavior: "smooth" },
            root: { flex: 1 },
          }}
        >
          <SegmentedControl
            value={activeTab}
            onChange={handleTabChange}
            data={blockEditTabOptions}
            className={classes.segmentedControl}
            styles={{
              root: {
                width: "100%",
              },
            }}
          />
        </ScrollArea>
      </Group>

      {activeTab === BlockEditTab.main && (
        <MainTabContent block={block} onSave={saveBlock} bookUuid={bookUuid} />
      )}

      {activeTab === BlockEditTab.parameters && (
        <ParamManager
          blockUuid={blockUuid}
          bookUuid={bookUuid}
          useTabs={block?.useTabs}
          otherBlocks={[...otherBlocks, block]}
        />
      )}

      {activeTab === BlockEditTab.relations && (
        <RelationManager otherBlocks={otherBlocks || []} block={block} bookUuid={bookUuid} />
      )}

      {activeTab === BlockEditTab.nested && (
        <NestedBlocksManager
          otherBlocks={otherBlocks || []}
          blockUuid={blockUuid}
          bookUuid={bookUuid}
        />
      )}

      {activeTab === BlockEditTab.tabs && (
        <BlockTabsManager
          otherRelations={blockRelations || []}
          currentBlockUuid={blockUuid}
          otherBlocks={otherBlocks}
          bookUuid={bookUuid}
        />
      )}
    </Container>
  );
};
