import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { InkLuminApiError } from "@/api/inkLuminMlApi";
import { IBlock, IBlockRelation, IBlockTitleForms } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { BlockRelationRepository } from "@/repository/Block/BlockRelationRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { ConfigurationRepository } from "@/repository/ConfigurationRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export const useBlockEditForm = (
  blockUuid: string,
  bookUuid?: string,
  currentGroupUuid?: string
) => {
  const db = useDb(bookUuid);
  const isBookDb = !!bookUuid;

  const block = useLiveQuery<IBlock>(() => {
    if (!blockUuid || !db) {
      return;
    }
    return BlockRepository.getByUuid(db, blockUuid);
  }, [blockUuid, db]);

  const otherBlocks = useLiveQuery<IBlock[]>(() => {
    if (!blockUuid || !db || !block) {
      return;
    }
    return BlockRepository.getSiblings(db, block);
  }, [block, db]);

  const configuration = useLiveQuery(() => {
    if (!blockUuid || !block || !db) return null;
    return ConfigurationRepository.getByUuid(db, block?.configurationUuid);
  }, [block, block?.uuid, db]);

  const blockRelations = useLiveQuery<IBlockRelation[]>(() => {
    if (!block || !db) {
      return [];
    }
    return BlockRelationRepository.getBlockRelations(db, blockUuid);
  }, [blockUuid, db]);

  const saveBlock = async (blockData: Partial<IBlock>, manualTitleForms?: IBlockTitleForms) => {
    if (!blockData.uuid && !block?.uuid) {
      // If it's a new block (no UUID yet)
      blockData.uuid = generateUUID(); // Assign a UUID if not already present
    }

    // Ensure we have a full block object to save, using existing block data as a base if partial data is provided
    const blockToSave: IBlock = {
      ...(block || {}), // Spread existing block data from the hook's state
      ...blockData, // Spread new/updated data
    } as IBlock; // Type assertion might be needed if fields are truly partial

    if (!blockToSave.uuid) {
      // This case should ideally be handled by the check above, but as a safeguard:
      throw new Error("Block UUID is missing for save operation.");
    }
    if (!blockToSave.configurationUuid && configuration?.uuid) {
      blockToSave.configurationUuid = configuration.uuid;
    }

    try {
      await BlockRepository.save(db, blockToSave, isBookDb, manualTitleForms);
      notifications.show({
        title: "Успешно",
        message: "Блок сохранен",
      });
    } catch (error) {
      if (error instanceof InkLuminApiError) {
        console.error("API error during save:", error);
        // This error will be handled by the dialog display logic (next step)
        throw error; // Important to propagate for dialog trigger
      } else {
        notifications.show({
          title: "Ошибка сохранения",
          message: error instanceof Error ? error.message : "Не удалось сохранить блок",
          color: "red",
        });
        // Optionally re-throw generic errors if needed elsewhere, or handle them fully here
        // For now, we show a notification for non-API errors.
      }
    }
  };

  return {
    block,
    otherBlocks,
    saveBlock,
    configuration,
    blockRelations,
  };
};
