
import { Button, Group, Modal, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IBlock } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface NestedBlockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockUuid: string, structureKind: string) => void;
  availableBlocks: IBlock[];
  initialData?: { blockUuid?: string; displayKind?: string };
}

const displayKindOptions = [
  { value: "list", label: "Список" },
  { value: "timeLine", label: "Временная линия" },
];

export const NestedBlockEditModal = ({
  isOpen,
  onClose,
  onSave,
  availableBlocks,
  initialData,
}: NestedBlockEditModalProps) => {
  const { isMobile } = useMedia();
  const form = useForm({
    initialValues: {
      blockUuid: initialData?.blockUuid || "",
      displayKind: initialData?.displayKind || "list",
    },
  });

  const handleSave = () => {
    onSave(form.values.blockUuid, form.values.displayKind);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={initialData ? "Редактирование блока" : "Вложить блок"}
      fullScreen={isMobile}
    >
      <Stack>
        <Select
          label="Блок"
          data={availableBlocks.map((b) => ({ value: b.uuid!, label: b.title }))}
          {...form.getInputProps("blockUuid")}
          required
        />

        <Select
          label="Тип отображения"
          data={displayKindOptions}
          {...form.getInputProps("displayKind")}
          required
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
