import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { bookDb } from "@/entities/bookDb";
import { IBlock } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { generateUUID } from "@/utils/UUIDUtils";

interface CreateNestedInstanceModalProps {
  opened: boolean;
  onClose: () => void;
  blockUuid: string;
  blockInstanceUuid: string;
  relatedBlock: IBlock;
}

export const CreateNestedInstanceModal = ({
  opened,
  onClose,
  blockInstanceUuid,
  relatedBlock,
}: CreateNestedInstanceModalProps) => {
  const { isMobile } = useMedia();
  const form = useForm({
    initialValues: {
      title: "",
    },
    validate: {
      title: (value) => (value.trim() ? null : "Введите название"),
    },
  });

  const handleCreate = async () => {
    await BlockInstanceRepository.create(bookDb, {
      uuid: generateUUID(),
      blockUuid: relatedBlock.uuid,
      title: form.values.title.trim(),
      hostInstanceUuid: blockInstanceUuid,
    });
    onClose();
    form.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Добавить ${relatedBlock?.title}`}
      fullScreen={isMobile}
    >
      <Stack>
        <TextInput label="Название" {...form.getInputProps("title")} autoFocus />
        <Button onClick={handleCreate}>Создать</Button>
      </Stack>
    </Modal>
  );
};
