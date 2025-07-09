import { Button, Group, Select, Stack } from "@mantine/core";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { mapInstancesToOptions } from "../utils";

interface NestedBlockModalProps {
  relatedHostBlock?: IBlock;
  relatedHostInstances?: IBlockInstance[];
  relatedNestedInstances?: IBlockInstance[];
  hostInstanceUuid: string;
  targetInstanceUuid: string;
  relatedBlock: IBlock;
  onParentChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

export const NestedBlockModal = ({
  relatedHostBlock,
  relatedHostInstances,
  relatedNestedInstances,
  hostInstanceUuid,
  targetInstanceUuid,
  relatedBlock,
  onParentChange,
  onTargetChange,
  onCreate,
  isLoading,
}: NestedBlockModalProps) => (
  <Stack>
    <Select
      label={`${relatedHostBlock?.title}`}
      placeholder={`Выберите ${relatedHostBlock?.titleForms?.accusative}`}
      value={hostInstanceUuid}
      data={mapInstancesToOptions(relatedHostInstances)}
      onChange={(v) => onParentChange(v || "")}
      searchable
      clearable
    />

    {hostInstanceUuid && (
      <Select
        label={`${relatedBlock.title}`}
        placeholder={
          relatedNestedInstances?.length
            ? `Выберите ${relatedBlock.titleForms?.accusative}`
            : "Нет доступных"
        }
        value={targetInstanceUuid}
        data={mapInstancesToOptions(relatedNestedInstances)}
        onChange={(v) => onTargetChange(v || "")}
        disabled={!relatedNestedInstances?.length}
        description={!relatedNestedInstances?.length && "Нет вложенных элементов"}
        searchable
      />
    )}

    <Group justify="flex-end" mt="md">
      <Button onClick={onCreate} disabled={!targetInstanceUuid} loading={isLoading}>
        Создать связь
      </Button>
    </Group>
  </Stack>
);
