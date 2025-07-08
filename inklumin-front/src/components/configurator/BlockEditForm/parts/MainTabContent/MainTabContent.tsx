import React, { useState } from "react";
import { IconPhoto, IconQuestionMark, IconTrash } from "@tabler/icons-react";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Image as MantineImage,
  Select,
  SimpleGrid,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { InkLuminApiError, InkLuminMlApi } from "@/api/inkLuminMlApi";
import { IconSelector } from "@/components/shared/IconSelector/IconSelector";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { InlineEdit2 } from "@/components/shared/InlineEdit2/InlineEdit2";
import { LoadingOverlayExtended } from "@/components/shared/overlay/LoadingOverlayExtended";
import { UserDocEditor } from "@/components/userDoc/UserDocEditor";
import {
  IBlock,
  IBlockStructureKind,
  IBlockStructureKindTitle,
  IBlockTitleForms,
  IIconKind,
  IUserDocPage,
} from "@/entities/ConstructorEntities";

interface MainTabContentProps {
  block: IBlock;
  onSave: (blockData: IBlock, titleForms?: IBlockTitleForms) => Promise<void>;
  bookUuid?: string;
}

const structureKindOptions = [
  { value: IBlockStructureKind.single, label: IBlockStructureKindTitle.single },
  { value: IBlockStructureKind.multiple, label: IBlockStructureKindTitle.multiple },
];

export const MainTabContent = ({ block, onSave, bookUuid }: MainTabContentProps) => {
  const [iconDrawerOpen, setIconDrawerOpen] = useState(false);
  const [kbOpened, setKbOpened] = useState(false);
  const [titleFormsLoading, setTitleFormsLoading] = useState(false);

  const handleSavePage = async (page: IUserDocPage) => {
    await onSave({ ...block, userDocPageUuid: page.uuid });
  };

  const handleBlockPropertyChange = async (changedProps: Partial<IBlock>) => {
    const updatedBlock = { ...block, ...changedProps };
    await onSave(updatedBlock);
  };

  const handleTitleChange = async (newTitle: string) => {
    const updatedBlock = { ...block, title: newTitle };
    setTitleFormsLoading(true);
    try {
      const titleForms = await InkLuminMlApi.fetchAndPrepareTitleForms(newTitle);
      await onSave(updatedBlock, titleForms);
    } catch (error) {
      if (error instanceof InkLuminApiError) {
        notifications.show({
          title: "Предупреждение",
          message: `Не удалось получить формы названия: ${error.message}`,
          color: "yellow",
        });
        await onSave(updatedBlock);
      } else {
        notifications.show({
          title: "Ошибка",
          message: "Не удалось сохранить изменения",
          color: "red",
        });
      }
    } finally {
      setTitleFormsLoading(false);
    }
  };

  const handleTitleFormChange = async (field: keyof IBlockTitleForms, value: string) => {
    const currentTitleForms = block.titleForms || {
      nominative: block.title || "",
      genitive: "",
      dative: "",
      accusative: "",
      instrumental: "",
      prepositional: "",
      plural: "",
    };

    const updatedTitleForms = {
      ...currentTitleForms,
      [field]: value,
    };

    await onSave(block, updatedTitleForms);
  };

  const currentTitleForms = block.titleForms || {
    nominative: block.title || "",
    genitive: "",
    dative: "",
    accusative: "",
    instrumental: "",
    prepositional: "",
    plural: "",
  };

  return (
    <>
      <LoadingOverlayExtended visible={titleFormsLoading} message="Загрузка форм названия..." />

      {/* === ОБЩЕЕ ======================================================= */}
      <Card withBorder radius="md" p="lg" mb="lg">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={4}>Общее</Title>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setKbOpened(true)}
              title="Статья"
            >
              <IconQuestionMark size="1rem" />
            </ActionIcon>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <InlineEdit2
              onChange={handleTitleChange}
              value={block?.title}
              placeholder="введите название..."
              label={"Название блока"}
            />

            <Select
              value={block?.structureKind || IBlockStructureKind.single}
              onChange={(value) => handleBlockPropertyChange({ structureKind: value })}
              data={structureKindOptions}
              label="Тип структуры"
              placeholder="Выберите тип структуры"
            />
          </SimpleGrid>

          <InlineEdit2
            onChange={(value) => handleBlockPropertyChange({ description: value })}
            value={block?.description}
            placeholder="введите описание..."
            label={"Описание"}
          />

          <Divider my="sm" label="Опции" labelPosition="center" labelProps={{ size: "sm" }} />

          <Stack gap="xs">
            <Checkbox
              checked={block?.useTabs === 1}
              label="Использовать вкладки для группировки параметров"
              onChange={(e) =>
                handleBlockPropertyChange({ useTabs: e.currentTarget.checked ? 1 : 0 })
              }
            />
            <Checkbox
              checked={block?.useGroups === 1}
              label="Группировать элементы"
              onChange={(e) =>
                handleBlockPropertyChange({ useGroups: e.currentTarget.checked ? 1 : 0 })
              }
            />
            <Checkbox
              checked={block?.sceneLinkAllowed === 1}
              label="Привязка к сцене"
              onChange={(e) =>
                handleBlockPropertyChange({ sceneLinkAllowed: e.currentTarget.checked ? 1 : 0 })
              }
            />
            <Checkbox
              checked={block?.showInSceneList === 1}
              label="Отображать в списке сцен"
              onChange={(e) =>
                handleBlockPropertyChange({ showInSceneList: e.currentTarget.checked ? 1 : 0 })
              }
            />
            <Checkbox
              checked={block?.showInMainMenu === 1}
              label="Отображать в главном меню"
              onChange={(e) =>
                handleBlockPropertyChange({ showInMainMenu: e.currentTarget.checked ? 1 : 0 })
              }
            />
            <Checkbox
              checked={block?.showBigHeader === 1}
              label="Отображать крупный заголовок"
              onChange={(e) =>
                handleBlockPropertyChange({ showBigHeader: e.currentTarget.checked ? 1 : 0 })
              }
            />
          </Stack>
        </Stack>
      </Card>

      {/* === ИКОНКА БЛОКА ================================================== */}
      <Card withBorder radius="md" p="lg" mb="lg">
        <Title order={4} mb="sm">
          Иконка блока
        </Title>
        <Group>
          {block?.icon ? (
            <Group>
              {block.icon.iconKind === IIconKind.gameIcons ? (
                <IconViewer
                  iconName={block.icon.iconName}
                  size={64}
                  style={{ color: "var(--mantine-color-blue-filled)" }}
                />
              ) : (
                <MantineImage
                  src={block.icon.iconBase64}
                  alt="Custom icon"
                  style={{ width: 64, height: 64 }}
                  radius="sm"
                />
              )}
              <Button onClick={() => setIconDrawerOpen(true)} variant="outline" size="sm">
                Изменить
              </Button>
              <Button
                onClick={() => handleBlockPropertyChange({ icon: undefined })}
                variant="subtle"
                color="red"
                size="sm"
                leftSection={<IconTrash size={14} />}
              >
                Удалить
              </Button>
            </Group>
          ) : (
            <Button
              onClick={() => setIconDrawerOpen(true)}
              variant="outline"
              size="sm"
              leftSection={<IconPhoto size={16} />}
            >
              Выбрать иконку
            </Button>
          )}
        </Group>
      </Card>

      <IconSelector
        opened={iconDrawerOpen}
        onClose={() => setIconDrawerOpen(false)}
        onSelect={(icon) => handleBlockPropertyChange({ icon })}
        initialIcon={block?.icon}
      />

      {/* === ФОРМЫ НАЗВАНИЯ =============================================== */}
      <Card withBorder radius="md" p="lg" mb="xl">
        <Title order={4} mb="sm">
          Формы названия
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <InlineEdit2
            label="Именительный (кто? что?)"
            value={currentTitleForms.nominative}
            onChange={(value) => handleTitleFormChange("nominative", value)}
            placeholder="Именительный падеж"
          />
          <InlineEdit2
            label="Родительный (кого? чего?)"
            value={currentTitleForms.genitive}
            onChange={(value) => handleTitleFormChange("genitive", value)}
            placeholder="Родительный падеж"
          />
          <InlineEdit2
            label="Дательный (кому? чему?)"
            value={currentTitleForms.dative}
            onChange={(value) => handleTitleFormChange("dative", value)}
            placeholder="Дательный падеж"
          />
          <InlineEdit2
            label="Винительный (кого? что?)"
            value={currentTitleForms.accusative}
            onChange={(value) => handleTitleFormChange("accusative", value)}
            placeholder="Винительный падеж"
          />
          <InlineEdit2
            label="Творительный (кем? чем?)"
            value={currentTitleForms.instrumental}
            onChange={(value) => handleTitleFormChange("instrumental", value)}
            placeholder="Творительный падеж"
          />
          <InlineEdit2
            label="Предложный (о ком? о чём?)"
            value={currentTitleForms.prepositional}
            onChange={(value) => handleTitleFormChange("prepositional", value)}
            placeholder="Предложный падеж"
          />
          {/* Множественное число занимает всю ширину */}
          <InlineEdit2
            label="Множественное число (Именительный)"
            value={currentTitleForms.plural}
            onChange={(value) => handleTitleFormChange("plural", value)}
            placeholder="Множественное число"
            style={{ gridColumn: "1 / -1" }}
          />
        </SimpleGrid>
      </Card>

      {block && (
        <UserDocEditor
          opened={kbOpened}
          onClose={() => setKbOpened(false)}
          pageUuid={block.userDocPageUuid}
          configurationUuid={block.configurationUuid}
          bookUuid={bookUuid}
          onSave={handleSavePage}
        />
      )}
    </>
  );
};
