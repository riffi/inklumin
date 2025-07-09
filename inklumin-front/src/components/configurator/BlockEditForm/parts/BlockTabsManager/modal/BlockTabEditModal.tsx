import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button, Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IBlock,
  IBlockParameter,
  IBlockParameterWithBlockTitle,
  IBlockRelation,
  IBlockTab,
  IBlockTabKind,
} from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface BlockTabEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<IBlockTab, "id">) => void;
  initialData?: IBlockTab;
  relations: IBlockRelation[];
  nestedBlocks: IBlock[];
  otherBlocks: IBlock[];
  referencingParams: IBlockParameterWithBlockTitle[];
  currentBlockUuid: string;
}

export const BlockTabEditModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  relations,
  nestedBlocks,
  otherBlocks,
  currentBlockUuid,
  referencingParams,
}: BlockTabEditModalProps) => {
  const { isMobile } = useMedia();
  const form = useForm<Omit<IBlockTab, "id">>({
    initialValues: {
      title: initialData?.title || "",
      tabKind: initialData?.tabKind || "relation",
      relationUuid: initialData?.relationUuid || "",
      nestedBlockUuid: initialData?.nestedBlockUuid || "",
      orderNumber: initialData?.orderNumber || 0,
      blockUuid: initialData?.blockUuid || "",
      uuid: initialData?.uuid || "",
      isDefault: 0,
    },
  });

  const handleSubmit = () => {
    onSave(form.values);
    onClose();
  };

  useEffect(() => {
    if (form.values.tabKind === "relation" && form.values.relationUuid) {
      const relation = relations.find((r) => r.uuid === form.values.relationUuid);
      const targetBlock = relation
        ? otherBlocks.find(
            (b) =>
              b.uuid ===
              (relation.sourceBlockUuid === currentBlockUuid
                ? relation.targetBlockUuid
                : relation.sourceBlockUuid)
          )
        : null;
      form.setFieldValue("title", targetBlock?.titleForms?.plural || "");
    }

    if (form.values.tabKind === "nestedBlock" && form.values.nestedBlockUuid) {
      const nestedBlock = nestedBlocks.find((b) => b.uuid === form.values.nestedBlockUuid);
      form.setFieldValue("title", nestedBlock?.titleForms?.plural || "");
    }
  }, [form.values.relationUuid, form.values.nestedBlockUuid]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={initialData ? "Редактирование вкладки" : "Новая вкладка"}
      fullScreen={isMobile}
    >
      <Stack>
        <Select
          disabled={initialData?.isDefault === 1}
          label="Тип вкладки"
          data={[
            { value: IBlockTabKind.relation, label: "Связи" },
            { value: IBlockTabKind.nestedBlock, label: "Вложенные блоки" },
            { value: IBlockTabKind.parameters, label: "Параметры" },
            { value: IBlockTabKind.referencingParam, label: "Ссылающийся параметр" },
            { value: IBlockTabKind.scenes, label: "Сцены" }, // Added new option
          ]}
          {...form.getInputProps("tabKind")}
        />

        {form.values.tabKind === "relation" && (
          <Select
            label="Связь"
            data={relations.map((r) => ({
              value: r.uuid!,
              label: `Связь с ${
                otherBlocks.find(
                  (b) =>
                    b.uuid ===
                    (r.sourceBlockUuid === currentBlockUuid ? r.targetBlockUuid : r.sourceBlockUuid)
                )?.title || "Неизвестный блок"
              } (${r.relationType})`,
            }))}
            {...form.getInputProps("relationUuid")}
          />
        )}

        {form.values.tabKind === "nestedBlock" && (
          <Select
            label="Вложенный блок"
            data={nestedBlocks.map((b) => ({
              value: b.uuid!,
              label: b.title,
            }))}
            {...form.getInputProps("nestedBlockUuid")}
          />
        )}

        {form.values.tabKind === IBlockTabKind.referencingParam && (
          <Select
            label="Параметр"
            data={referencingParams.map((p) => ({
              value: p.uuid!,
              label: `${p.blockTitle}: ${p.title}`,
            }))}
            {...form.getInputProps("referencingParamUuid")}
          />
        )}

        <TextInput label="Название вкладки" required {...form.getInputProps("title")} />

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
