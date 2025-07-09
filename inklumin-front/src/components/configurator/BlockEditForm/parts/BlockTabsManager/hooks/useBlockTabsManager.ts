// useBlockTabsManager.ts
import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { IBlock, IBlockTab } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { BlockTabRepository } from "@/repository/Block/BlockTabRepository";

interface UseBlockTabsManagerProps {
  bookUuid: string;
  blockUuid: string;
}

export const useBlockTabsManager = ({ bookUuid, blockUuid }: UseBlockTabsManagerProps) => {
  const db = useDb(bookUuid);
  const isBookDb = !!bookUuid;

  const tabs = useLiveQuery<IBlockTab[]>(() => {
    return BlockTabRepository.getBlockTabs(db, blockUuid);
  }, [blockUuid]);

  const nestedBlocks = useLiveQuery<IBlock[]>(() => {
    return db.blocks.where("hostBlockUuid").equals(blockUuid).toArray();
  }, [blockUuid]);

  const referencingParams = useLiveQuery(async () => {
    // Получаем все параметры связанные с блоком
    const params = await db.blockParameters.where("linkedBlockUuid").equals(blockUuid).toArray();

    // Если нет параметров - сразу возвращаем пустой массив
    if (!params.length) return [];

    // Собираем уникальные UUID блоков для запроса
    const blockUuids = [...new Set(params.map((p) => p.blockUuid))];

    // Получаем все связанные блоки одним запросом
    const blocks = await db.blocks.where("uuid").anyOf(blockUuids).toArray();

    // Создаем карту для быстрого доступа к блокам
    const blocksMap = new Map(blocks.map((b) => [b.uuid, b]));

    // Собираем результирующие данные
    return params.map((p) => ({
      ...p,
      blockTitle: blocksMap.get(p.blockUuid)?.title,
    }));
  }, [blockUuid]);

  const saveTab = async (tab: IBlockTab) => {
    try {
      await BlockTabRepository.saveTab(db, tab);
    } catch (error) {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось сохранить вкладку",
        color: "red",
      });
    }
  };

  const deleteTab = async (uuid: string) => {
    await BlockTabRepository.deleteTab(db, uuid);
  };

  const moveTabUp = async (uuid: string) => {
    await BlockTabRepository.moveTab(db, blockUuid, uuid, "up");
  };

  const moveTabDown = async (uuid: string) => {
    await BlockTabRepository.moveTab(db, blockUuid, uuid, "down");
  };

  return {
    tabs,
    nestedBlocks,
    referencingParams,
    saveTab,
    deleteTab,
    moveTabUp,
    moveTabDown,
  };
};
