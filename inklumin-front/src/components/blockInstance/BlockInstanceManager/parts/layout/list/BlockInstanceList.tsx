import React from "react";
import { Table, Text } from "@mantine/core";
import { IBlockInstanceWithParams } from "@/components/blockInstance/BlockInstanceManager/hooks/useBlockInstanceManager";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock, IBlockParameter } from "@/entities/ConstructorEntities";
import { BlockInstanceTableRow } from "./BlockInstanceTableRow";
import classes from "../../../BlockInstanceManager.module.css";

interface IBlockInstanceListProps {
  instances: IBlockInstanceWithParams[];
  block?: IBlock | null;
  displayedParameters?: IBlockParameter[];
  onEdit: (uuid: string) => void;
  onDelete: (instance: IBlockInstance) => void;
  onMove: (uuid: string) => void;
}

/**
 * Компонент отображает экземпляры блока в виде таблицы
 */
export const BlockInstanceList = ({
  instances,
  block,
  displayedParameters,
  onEdit,
  onDelete,
  onMove,
}: IBlockInstanceListProps) => {
  if (instances.length === 0) {
    return (
      <Table highlightOnHover className={classes.table}>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Text c="dimmed" ta="center" py="md" size="sm">
                Добавьте {block?.titleForms?.accusative}
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <Table highlightOnHover className={classes.table}>
      <Table.Tbody>
        {instances.map((instance) => (
          <BlockInstanceTableRow
            key={instance.uuid!}
            instance={instance}
            block={block}
            displayedParameters={displayedParameters}
            onEdit={() => onEdit(instance.uuid!)}
            onDelete={() => onDelete(instance)}
            onMove={onMove}
          />
        ))}
      </Table.Tbody>
    </Table>
  );
};
