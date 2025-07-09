import { useState } from "react";
import { Button, Group, Modal, Table } from "@mantine/core";
import { useBlockRelationsEditor } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceRelationsEditor/hook/useBlockRelationsEditor";
import { NestedBlockModal } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceRelationsEditor/modal/NestedBlockModal";
import { DefaultModal } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceRelationsEditor/modal/DefaultModal";
import { RelationRow } from "@/components/blockInstance/BlockInstanceEditor/parts/InstanceRelationsEditor/RelationRow";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstanceRelation } from "@/entities/BookEntities";
import { IBlock, IBlockRelation } from "@/entities/ConstructorEntities";
import { useDialog } from "@/providers/DialogProvider/DialogProvider";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { BlockInstanceRelationRepository } from "@/repository/BlockInstance/BlockInstanceRelationRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";

interface BlockRelationsEditorProps {
  blockUuid: string;
  blockInstanceUuid: string;
  relatedBlock: IBlock;
  blockRelation: IBlockRelation;
}

export const InstanceRelationsEditor = ({
  blockInstanceUuid,
  relatedBlock,
  blockRelation,
  blockUuid,
}: BlockRelationsEditorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetInstanceUuid, setTargetInstanceUuid] = useState("");
  const [hostInstanceUuid, setHostInstanceUuid] = useState("");

  const isRelatedBlockNested = !!relatedBlock?.hostBlockUuid;
  const isRelatedBlockTarget = blockRelation.targetBlockUuid === relatedBlock?.uuid;
  const { isMobile } = useMedia();
  const { showDialog } = useDialog();

  const {
    relatedParentInstances,
    relatedParentBlock,
    relatedChildInstances,
    instanceRelations,
    allRelatedInstances,
    unusedRelatedInstances,
    createBlockInstanceRelation,
  } = useBlockRelationsEditor(
    blockInstanceUuid,
    relatedBlock,
    isRelatedBlockTarget,
    isRelatedBlockNested,
    hostInstanceUuid,
    blockUuid
  );

  if (!relatedBlock) return null;

  const handleCreateRelation = async () => {
    await createBlockInstanceRelation(targetInstanceUuid, blockRelation?.uuid);
    resetModalState();
  };

  const deleteRelation = async (relation: IBlockInstanceRelation) => {
    const result = await showDialog("Внимание", "Вы действительно хотите удалить связь?");
    if (!result) return;
    await BlockInstanceRelationRepository.removeRelation(bookDb, relation);
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setHostInstanceUuid("");
    setTargetInstanceUuid("");
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="light"
          disabled={!isRelatedBlockNested && unusedRelatedInstances.length === 0}
        >
          {`Добавить ${relatedBlock?.titleForms?.accusative}`}
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{relatedBlock.title}</Table.Th>
            {isRelatedBlockNested && <Table.Th>{relatedParentBlock?.title}</Table.Th>}
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {instanceRelations?.map((relation) => (
            <RelationRow
              key={relation.blockRelationUuid}
              relation={relation}
              relatedParentInstances={relatedParentInstances}
              isRelatedBlockNested={isRelatedBlockNested}
              isRelatedBlockTarget={isRelatedBlockTarget}
              allRelatedInstances={allRelatedInstances}
              onDelete={deleteRelation}
            />
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={isModalOpen}
        fullscreen={isMobile}
        onClose={resetModalState}
        title={`Добавить ${relatedBlock?.titleForms?.accusative}`}
      >
        <>
          {isRelatedBlockNested ? (
            <NestedBlockModal
              relatedHostBlock={relatedParentBlock}
              relatedHostInstances={relatedParentInstances}
              relatedNestedInstances={relatedChildInstances}
              hostInstanceUuid={hostInstanceUuid}
              targetInstanceUuid={targetInstanceUuid}
              relatedBlock={relatedBlock}
              onParentChange={setHostInstanceUuid}
              onTargetChange={setTargetInstanceUuid}
              onCreate={handleCreateRelation}
              isLoading={!relatedChildInstances}
            />
          ) : (
            <DefaultModal
              relatedBlock={relatedBlock}
              unusedRelatedInstances={unusedRelatedInstances}
              targetInstanceUuid={targetInstanceUuid}
              onTargetChange={setTargetInstanceUuid}
              onCreate={handleCreateRelation}
            />
          )}
        </>
      </Modal>
    </div>
  );
};
