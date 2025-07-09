import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { IBlock } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { BlockRepository } from "@/repository/Block/BlockRepository";

export const useNestedBlocksManager = (
  blockUuid: string,
  bookUuid?: string,
  otherBlocks: IBlock[]
) => {
  const db = useDb(bookUuid);

  const nestedBlocks = useLiveQuery<IBlock[]>(() => {
    return BlockRepository.getNested(db, blockUuid);
  }, [blockUuid]);

  const availableBlocks =
      otherBlocks?.filter((b) => !nestedBlocks?.some((nested) => nested.uuid === b.uuid)) || [];

  const linkNested = async (nestedBlockUuid: string, displayKind: string) => {
    try {
      const nestedBlock = await BlockRepository.getByUuid(db, nestedBlockUuid);
      if (nestedBlock) {
        await BlockRepository.linkNestedToHost(
            db,
            {
              ...nestedBlock,
              displayKind,
            },
            blockUuid
        );
        notifications.show({
          title: "Успешно",
          message: "Вложенный блок привязан",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось привязать вложенный блок",
        color: "red",
      });
    }
  };

  const updateNestedDisplayKind = async (nestedBlockUuid: string, displayKind: string) => {
    try {
      const block = await BlockRepository.getByUuid(db, nestedBlockUuid);
      if (block) {
        await db.blocks.update(block.id!, {
          ...block,
          displayKind,
        });
        notifications.show({
          title: "Успешно",
          message: "Настройки блока обновлены",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось обновить блок",
        color: "red",
      });
    }
  };

  const unlinkNested = async (nestedBlockUuid: string) => {
    try {
      const nestedBlock = await BlockRepository.getByUuid(db, nestedBlockUuid);
      if (nestedBlock) {
        await BlockRepository.unlinkNestedFromParent(db, nestedBlock);
        notifications.show({
          title: "Успешно",
          message: "Вложенный блок отвязан",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось отвязать вложенный блок",
        color: "red",
      });
    }
  };

  return {
    nestedBlocks: nestedBlocks || [],
    otherBlocks: otherBlocks || [],
    availableBlocks,
    linkNested,
    updateNestedDisplayKind,
    unlinkNested,
  }
}
