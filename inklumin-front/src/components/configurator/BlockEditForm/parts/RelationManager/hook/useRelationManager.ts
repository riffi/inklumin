import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { BlockRelationType, IBlock, IBlockRelation } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { BlockRelationRepository } from "@/repository/Block/BlockRelationRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export const useRelationManager = (block: IBlock, bookUuid?: string, otherBlocks?: IBlock[]) => {
  const db = useDb(bookUuid);
  const isBookDb = !!bookUuid;
  const blockUuid = block.uuid;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRelation, setCurrentRelation] = useState<IBlockRelation | undefined>();

  const blockRelations = useLiveQuery<IBlockRelation[]>(() => {
    return BlockRelationRepository.getBlockRelations(db, blockUuid);
  }, [blockUuid]);

  const handleOpenModal = (relation?: IBlockRelation) => {
    setCurrentRelation(
      relation || {
        sourceBlockUuid: blockUuid,
        targetBlockUuid: "",
        relationType: BlockRelationType.ONE_TO_ONE,
        configurationUuid: block.configurationUuid || "",
      }
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRelation(undefined);
  };

  const saveRelation = async (relation: IBlockRelation) => {
    try {
      await BlockRelationRepository.save(db, relation);
      notifications.show({
        title: "Успешно",
        message: "Связь сохранена",
      });
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось сохранить связь",
        color: "red",
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const deleteRelation = async (relationUuid: string) => {
    try {
      await BlockRelationRepository.remove(db, relationUuid);
      notifications.show({
        title: "Успешно",
        message: "Связь удалена",
      });
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось удалить связь",
        color: "red",
      });
    }
  };

  return {
    blockRelations,
    isModalOpen,
    currentRelation,
    handleOpenModal,
    handleCloseModal,
    saveRelation,
    deleteRelation,
  };
};
