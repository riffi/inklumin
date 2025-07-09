import { useCallback, useState } from "react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { ActionIcon, Button, Group, Table, Text } from "@mantine/core";
import { useNestedBlocksManager } from "@/components/configurator/BlockEditForm/parts/NestedBlocksManager/hook/useNestedBlockManager";
import { IBlock, IBlockDisplayKindTitle } from "@/entities/ConstructorEntities";
import { NestedBlockEditModal } from "@/components/configurator/BlockEditForm/parts/NestedBlocksManager/modal/NestedBlockEditModal";

interface NestedBlocksManagerProps {
  blockUuid: string;
  bookUuid?: string;
  otherBlocks: IBlock[];
}

export const NestedBlocksManager = ({
  blockUuid,
  bookUuid,
  otherBlocks,
}: NestedBlocksManagerProps) => {
  const [editingBlock, setEditingBlock] = useState<IBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { nestedBlocks, availableBlocks, linkNested, updateNestedDisplayKind, unlinkNested } =
    useNestedBlocksManager(blockUuid, bookUuid, otherBlocks);

  const handleSave = useCallback(
    async (blockUuid: string, displayKind: string) => {
      if (editingBlock) {
        await updateNestedDisplayKind(editingBlock.uuid!, displayKind);
      } else {
        await linkNested(blockUuid, displayKind);
      }
      setEditingBlock(null);
    },
    [editingBlock, updateNestedDisplayKind, linkNested]
  );

  return (
    <div>
      <Group justify="flex-start" mb="md">
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => setIsModalOpen(true)}
          size="sm"
          variant="light"
        >
          Вложить блок
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название блока</Table.Th>
            <Table.Th>Тип отображения</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {nestedBlocks.map((block) => (
            <Table.Tr key={block.uuid}>
              <Table.Td>{block.title}</Table.Td>
              <Table.Td>
                <Text>{IBlockDisplayKindTitle[block.displayKind] || "Неизвестно"}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => {
                      setEditingBlock(block);
                      setIsModalOpen(true);
                    }}
                  >
                    <IconEdit size="1rem" />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => unlinkNested(block.uuid!)}>
                    <IconTrash size="1rem" />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <NestedBlockEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleSave}
        availableBlocks={editingBlock ? [...availableBlocks, editingBlock] : availableBlocks}
        initialData={
          editingBlock
            ? {
                blockUuid: editingBlock.uuid,
                displayKind: editingBlock.displayKind,
              }
            : undefined
        }
      />
    </div>
  );
};
