import { Button, Modal, Select } from "@mantine/core";
import { IBlockInstanceGroup } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface IMoveInstanceModalProps {
  opened: boolean;
  groups?: IBlockInstanceGroup[];
  selectedGroup: string;
  onChangeGroup: (uuid: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Модальное окно перемещения экземпляра
 */
export const MoveInstanceModal = ({
  opened,
  groups,
  selectedGroup,
  onChangeGroup,
  onConfirm,
  onClose,
}: IMoveInstanceModalProps) => {
  const { isMobile } = useMedia();

  return (
    <Modal opened={opened} onClose={onClose} title="Переместить экземпляр" fullScreen={isMobile}>
      <Select
        label="Группа"
        data={[
          { value: "none", label: "Без групп" },
          ...(groups || []).map((g) => ({ value: g.uuid!, label: g.title })),
        ]}
        value={selectedGroup}
        onChange={(v) => onChangeGroup(v!)}
      />
      <Button fullWidth mt="md" onClick={onConfirm}>
        Переместить
      </Button>
    </Modal>
  );
};
