import { Button, Select } from "@mantine/core";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { mapInstancesToOptions } from "../utils";

interface DefaultModalProps {
  relatedBlock?: IBlock;
  unusedRelatedInstances?: IBlockInstance[];
  targetInstanceUuid: string;
  onTargetChange: (value: string) => void;
  onCreate: () => void;
}

export const DefaultModal = ({
  relatedBlock,
  unusedRelatedInstances,
  targetInstanceUuid,
  onTargetChange,
  onCreate,
}: DefaultModalProps) => (
  <>
    <Select
      label={`Выберите ${relatedBlock?.titleForms?.accusative}`}
      value={targetInstanceUuid}
      data={mapInstancesToOptions(unusedRelatedInstances)}
      onChange={(v) => onTargetChange(v || "")}
    />
    <Button onClick={onCreate} disabled={!targetInstanceUuid} mt="md">
      Добавить
    </Button>
  </>
);
