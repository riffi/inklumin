import React, { useEffect, useState } from "react";
import { IconDownload, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  SegmentedControl,
  SimpleGrid,
  Space,
  Stack,
  Tabs, // Добавлен импорт Tabs
  Text,
  Title,
} from "@mantine/core";
import { BlockEditModal } from "@/components/configurator/BookConfigurationEditForm/BlockEditModal/BlockEditModal";
import { useBookConfigurationEditForm } from "@/components/configurator/BookConfigurationEditForm/useBookConfigurationEditForm";
import { BlocksMindMap } from "@/components/mindMap/BlocksMindMap/BlocksMindMap";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { bookDb } from "@/entities/bookDb";
import {
  IBlock,
  IBlockDisplayKind,
  IBlockStructureKind,
  IBlockStructureKindTitle,
  IBookConfiguration,
} from "@/entities/ConstructorEntities";
import { useDialog } from "@/providers/DialogProvider/DialogProvider";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { exportConfiguration } from "@/utils/configurationBackupManager";

export interface IBookConfigurationEditFormProps {
  bookConfigurationUuid: string;
  bookUuid?: string;
}

export const BookConfigurationEditForm = (props: IBookConfigurationEditFormProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>("blocks"); // Состояние активной вкладки

  const getBlackBlock = (): IBlock => {
    return {
      configurationUuid: props.bookConfigurationUuid,
      uuid: undefined,
      title: "",
      description: "",
      useTabs: 0,
      useGroups: 0,
      structureKind: IBlockStructureKind.multiple,
      displayKind: IBlockDisplayKind.list,
    };
  };

  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const [currentBlock, setCurrentBlock] = useState<IBookConfiguration>(getBlackBlock());
  const { isMobile } = useMedia();
  const { showDialog } = useDialog();

  const isBookConfiguration = !!props.bookUuid;

  const { configuration, blockList, saveBlock, paramGroupList, removeBlock, updateConfiguration } =
    useBookConfigurationEditForm(props.bookConfigurationUuid, props.bookUuid, currentBlock);

  const breadCrumbs = [
    { title: "Конфигуратор", href: "/configurator" },
    { title: configuration?.title, href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  function handleOpenBlockPage(c: IBlock) {
    let path = `/block/edit?uuid=${c.uuid}`;
    if (props.bookUuid) {
      path += `&bookUuid=${props.bookUuid}`;
    }
    return () => navigate(path);
  }

  const handleExport = async (uuid: string) => {
    await exportConfiguration(bookDb, uuid);
  };

  // Рендер контента вкладки "Блоки"
  const renderBlocksTab = () => (
    <>
      <Group>
        <Button
          variant="outline"
          leftSection={<IconDownload size={16} />}
          onClick={() => handleExport(configuration?.uuid!)}
        >
          Экспорт
        </Button>
      </Group>
      <Space h={10} />
      <Stack wrap="nowrap" gap="xs">
        <InlineEdit2
          onChange={(v) => updateConfiguration({ ...configuration, title: v })}
          value={configuration?.title}
          label={"Название"}
          placeholder={"Введите название"}
        />
        <InlineEdit2
          onChange={(v) => updateConfiguration({ ...configuration, description: v })}
          value={configuration?.description}
          label={"Описание"}
          placeholder={"Введите описание"}
        />
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        <Card
          shadow="xs"
          padding="lg"
          radius="md"
          withBorder
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setCurrentBlock(getBlackBlock());
            setIsModalOpened(true);
          }}
        >
          <Stack align="center" gap="xs">
            <IconPlus size={32} stroke={1.5} />
            <Text fw={500}>Добавить блок</Text>
          </Stack>
        </Card>
        {blockList?.map((c) => (
          <Card
            key={c.uuid}
            shadow="xs"
            padding="lg"
            radius="md"
            style={{
              cursor: "pointer",
            }}
            withBorder
            onClick={handleOpenBlockPage(c)}
          >
            <Stack gap="sm">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" align="center">
                  <IconViewer icon={c.icon} size={24} color={"gray"} />
                  <Text fw={500} truncate="end">
                    {c.title}
                  </Text>
                </Group>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(c);
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>

              <Group gap="xs">
                <Badge variant="light" color="grey">
                  {IBlockStructureKindTitle[c.structureKind]}
                </Badge>
                {c.useTabs === 1 && (
                  <Badge variant="light" color="grey">
                    Со вкладками
                  </Badge>
                )}
                {c.useGroups === 1 && (
                  <Badge variant="light" color="grey">
                    С группами
                  </Badge>
                )}
                {!!c.hostBlockUuid && (
                  <Badge variant="light" color="grey">
                    Вложенный
                  </Badge>
                )}
              </Group>

              {c.description && (
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {c.description}
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );

  return (
    <>
      <Container fluid style={{ backgroundColor: "white", padding: "20px" }}>
        <h2>Конфигурация{isBookConfiguration ? "" : `: ${configuration?.title}`}</h2>
        {!isBookConfiguration && (
          <>
            <Breadcrumbs separator="→" separatorMargin="md" mt="xs">
              {breadCrumbs}
            </Breadcrumbs>
            <Space h={20} />
          </>
        )}

        {isBookConfiguration ? (
          // Рендер с вкладками для книжной конфигурации
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="blocks">Блоки</Tabs.Tab>
              <Tabs.Tab value="diagram">Диаграмма</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="blocks" pt="xs">
              {renderBlocksTab()}
            </Tabs.Panel>

            <Tabs.Panel value="diagram" pt="xs">
              {activeTab === "diagram" && <BlocksMindMap />}
            </Tabs.Panel>
          </Tabs>
        ) : (
          // Стандартный рендер без вкладок
          renderBlocksTab()
        )}
      </Container>

      {isModalOpened && (
        <BlockEditModal
          isOpen={isModalOpened}
          configurationUuid={props.bookConfigurationUuid}
          onClose={() => setIsModalOpened(false)}
          onSave={async (blockData, titleForms) => {
            await saveBlock(blockData, titleForms);
          }}
          initialData={currentBlock}
        />
      )}
    </>
  );
};
