import { Button, Modal, Select } from "@mantine/core";
import { IBlockInstance, IBlockInstanceGroup } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { InstanceSelector } from "./parts/InstanceSelector";

interface IMoveInstanceModalProps {
  opened: boolean;
  groups?: IBlockInstanceGroup[];
  instances: IBlockInstance[];
  useGroups: boolean;
  selectedGroup: string;
  selectedParent: string | null;
  excludeUuids: string[];
  onChangeGroup: (uuid: string) => void;
  onChangeParent: (uuid: string | null) => void;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Модальное окно перемещения экземпляра
 */
export const MoveInstanceModal = ({
  opened,
  groups,
  instances,
  useGroups,
  selectedGroup,
  selectedParent,
  excludeUuids,
  onChangeGroup,
  onChangeParent,
  onConfirm,
  onClose,
}: IMoveInstanceModalProps) => {
  const { isMobile } = useMedia();

  return (
    <Modal opened={opened} onClose={onClose} title="Переместить экземпляр" fullScreen={isMobile}>
      {useGroups && (
        <Select
          label="Группа"
          data={[
            { value: "none", label: "Без групп" },
            ...(groups || []).map((g) => ({ value: g.uuid!, label: g.title })),
          ]}
          value={selectedGroup}
          onChange={(v) => onChangeGroup(v!)}
          mb="md"
        />
      )}
      <InstanceSelector
        blockUuid={instances[0]?.blockUuid || ""}
        groupUuid={useGroups ? selectedGroup : undefined}
        selectedUuid={selectedParent}
        onSelect={onChangeParent}
        excludeUuids={excludeUuids}
        includeTopLevel
      />
      <Button fullWidth mt="md" onClick={onConfirm}>
        Переместить
      </Button>
    </Modal>
  );
};
