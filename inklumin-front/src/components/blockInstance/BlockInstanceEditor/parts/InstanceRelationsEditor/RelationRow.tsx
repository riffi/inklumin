import { IconLink, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { ActionIcon, Group, Table } from "@mantine/core";
import { IBlockInstance, IBlockInstanceRelation } from "@/entities/BookEntities";

interface RelationRowProps {
  relation: IBlockInstanceRelation;
  relatedParentInstances?: IBlockInstance[];
  isRelatedBlockChild: boolean;
  allRelatedInstances?: IBlockInstance[];
  isRelatedBlockTarget: boolean;
  onDelete: (relation: IBlockInstanceRelation) => void;
}

export const RelationRow = ({
  relation,
  relatedParentInstances,
  isRelatedBlockChild,
  allRelatedInstances,
  isRelatedBlockTarget,
  onDelete,
}: RelationRowProps) => {
  const relatedInstanceUuid = isRelatedBlockTarget
    ? relation.targetInstanceUuid
    : relation.sourceInstanceUuid;

  const instance = allRelatedInstances?.find((i) => i.uuid === relatedInstanceUuid);
  const parentInstance = relatedParentInstances?.find(
    (parent) => parent.uuid === instance?.parentInstanceUuid
  );

  return (
    <Table.Tr>
      <Table.Td>{instance?.title}</Table.Td>
      {isRelatedBlockChild && <Table.Td>{parentInstance?.title}</Table.Td>}
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            component={Link}
            to={`/block-instance/card?uuid=${relatedInstanceUuid}`}
            variant="subtle"
          >
            <IconLink size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={() => onDelete(relation)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};
