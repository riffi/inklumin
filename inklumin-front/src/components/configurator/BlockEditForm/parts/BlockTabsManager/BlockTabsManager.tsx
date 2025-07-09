import { useCallback, useState } from "react";
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { ActionIcon, Button, Group, Table, Text } from "@mantine/core";
import { useBlockTabsManager } from "@/components/configurator/BlockEditForm/parts/BlockTabsManager/hooks/useBlockTabsManager";
import { IBlock, IBlockRelation, IBlockTab, IBlockTabKind } from "@/entities/ConstructorEntities";
import { BlockTabEditModal } from "./modal/BlockTabEditModal";

interface BlockTabsManagerProps {
  otherRelations: IBlockRelation[];
  otherBlocks: IBlock[];
  currentBlockUuid: string;
  bookUuid?: string;
}

export const BlockTabsManager = ({
  bookUuid,
  otherRelations,
  otherBlocks,
  currentBlockUuid,
}: BlockTabsManagerProps) => {
  const [editingTab, setEditingTab] = useState<IBlockTab | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = useCallback((tab?: IBlockTab) => {
    setEditingTab(tab || null);
    setIsModalOpen(true);
  }, []);

  const { tabs, nestedBlocks, referencingParams, saveTab, deleteTab, moveTabUp, moveTabDown } =
    useBlockTabsManager({
      bookUuid,
      blockUuid: currentBlockUuid,
    });

  const getRelatedBlockTitle = (relation: IBlockRelation) => {
    const relatedBlockUuid =
      relation.sourceBlockUuid === currentBlockUuid
        ? relation.targetBlockUuid
        : relation.sourceBlockUuid;

    return otherBlocks.find((b) => b.uuid === relatedBlockUuid)?.title || "Неизвестный блок";
  };

  const handleSave = useCallback(
    async (tabData: Omit<IBlockTab, "id">) => {
      if (editingTab) {
        await saveTab({ ...editingTab, ...tabData });
      } else {
        await saveTab({
          ...tabData,
          blockUuid: currentBlockUuid,
          uuid: "",
          orderNumber: tabs.length,
        });
      }
      setIsModalOpen(false);
      setEditingTab(null);
    },
    [editingTab, saveTab, currentBlockUuid, tabs?.length]
  );

  return (
    <div>
      <Group justify="flex-start" mb="md">
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => openModal()}
          size="sm"
          variant="light"
        >
          Добавить вкладку
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Тип</Table.Th>
            <Table.Th>Связанный элемент</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tabs?.map((tab, index) => (
            <Table.Tr key={tab.uuid}>
              <Table.Td>{tab.title}</Table.Td>
              <Table.Td>{tab.tabKind}</Table.Td>
              <Table.Td>
                {tab.tabKind === IBlockTabKind.nestedBlock
                  ? nestedBlocks?.find((b) => b.uuid === tab.nestedBlockUuid)?.title
                  : tab.tabKind === IBlockTabKind.relation
                    ? getRelatedBlockTitle(otherRelations.find((r) => r.uuid === tab.relationUuid)!)
                    : "—"}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => openModal(tab)}>
                    <IconEdit size="1rem" />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => deleteTab(tab.uuid!)}>
                    <IconTrash size="1rem" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => moveTabUp(tab.uuid!)}
                    disabled={index === 0}
                  >
                    <IconArrowUp size="1rem" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => moveTabDown(tab.uuid!)}
                    disabled={index === tabs?.length - 1}
                  >
                    <IconArrowDown size="1rem" />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {isModalOpen && (
        <BlockTabEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTab(null);
          }}
          onSave={handleSave}
          initialData={editingTab}
          relations={otherRelations.filter(
            (r) =>
              !tabs?.some(
                (t) => t.relationUuid === r.uuid && (!editingTab || t.uuid !== editingTab.uuid)
              )
          )}
          nestedBlocks={nestedBlocks?.filter(
            (b) =>
              !tabs?.some(
                (t) => t.nestedBlockUuid === b.uuid && (!editingTab || t.uuid !== editingTab.uuid)
              )
          )}
          referencingParams={referencingParams}
          currentBlockUuid={currentBlockUuid}
          otherBlocks={otherBlocks}
        />
      )}
    </div>
  );
};
