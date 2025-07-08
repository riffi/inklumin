import { useState } from "react";
import { Button, Group, Modal, Select, TextInput } from "@mantine/core";
import { IBlockInstanceGroup } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface IAddInstanceModalProps {
  opened: boolean;
  title: string;
  groups?: IBlockInstanceGroup[];
  currentGroupUuid: string;
  useGroups: boolean;
  onCreate: (name: string, description: string, groupUuid: string) => void;
  onClose: () => void;
  loading?: boolean;
}

/**
 * Модальное окно создания экземпляра
 */
export const AddInstanceModal = ({
  opened,
  title,
  groups,
  currentGroupUuid,
  useGroups,
  onCreate,
  onClose,
  loading,
}: IAddInstanceModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState(currentGroupUuid);
  const { isMobile } = useMedia();

  const handleCreate = () => {
    onCreate(name, description, group);
    setName("");
    setDescription("");
  };

  return (
    <Modal opened={opened} onClose={onClose} fullScreen={isMobile} title={title} centered>
      <TextInput
        label="Название"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Введите название"
        mb="md"
      />
      <TextInput
        label="Краткое описание"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        placeholder="Введите краткое описание (необязательно)"
        mb="md"
      />
      {useGroups && (
        <Select
          label="Группа"
          data={[
            { value: "none", label: "Без групп" },
            ...(groups || []).map((g) => ({ value: g.uuid!, label: g.title })),
          ]}
          value={group}
          onChange={(v) => setGroup(v || "none")}
          mb="md"
        />
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleCreate} disabled={!name.trim()} loading={loading}>
          Создать
        </Button>
      </Group>
    </Modal>
  );
};
