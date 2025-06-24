import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import type { BookDB } from "@/entities/bookDb";
import {
  IBlockParameter,
  IBlockParameterGroup,
  IBlockStructureKind,
} from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export const useBlockParams = (blockUuid: string, bookUuid?: string, currentGroupUuid?: string) => {
  const db = useDb(bookUuid);
  const isBookDb = !!bookUuid;

  const paramGroupList = useLiveQuery<IBlockParameterGroup[]>(() => {
    if (!blockUuid || !db) {
      return;
    }
    return db.blockParameterGroups.where("blockUuid").equals(blockUuid).sortBy("orderNumber");
  }, [blockUuid, db]);

  const paramList = useLiveQuery<IBlockParameter[]>(() => {
    if (currentGroupUuid) {
      return db.blockParameters
        .where({ groupUuid: currentGroupUuid, blockUuid })
        .sortBy("orderNumber");
    }
    return db.blockParameters.where({ blockUuid }).sortBy("orderNumber");
  }, [blockUuid, currentGroupUuid]);

  const saveParam = async (param: IBlockParameter) => {
    try {
      if (!param.id) {
        param.uuid = generateUUID();
        param.groupUuid = currentGroupUuid;
        param.orderNumber = paramList?.length;
        param.blockUuid = blockUuid;
      }

      await BlockParameterRepository.saveParam(db, blockUuid, param);
      notifications.show({ title: "Успешно", message: "Параметр сохранён" });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось сохранить параметр",
        color: "red",
      });
    }
  };

  const deleteParam = async (paramId: number) => {
    try {
      await BlockParameterRepository.deleteParam(db, paramId);
      notifications.show({ title: "Успешно", message: "Параметр удалён" });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось удалить параметр",
        color: "red",
      });
    }
  };

  const moveParamUp = async (paramId: number) => {
    const targetParam = await db.blockParameters.get(paramId);
    if (!targetParam) return;

    let siblings = paramList;
    if (targetParam.groupUuid) {
      siblings = paramList?.filter(
        (p) => p.groupUuid === targetParam.groupUuid && p.blockUuid === targetParam.blockUuid
      );
    } else {
      siblings = paramList?.filter((p) => !p.groupUuid && p.blockUuid === targetParam.blockUuid);
    }

    if (!siblings) return;

    const currentIndex = siblings.findIndex((p) => p.id === paramId);

    if (currentIndex <= 0) {
      notifications.show({
        title: "Информация",
        message: "Параметр уже наверху списка.",
      });
      return;
    }

    try {
      await BlockParameterRepository.moveParamUp(db, paramId);
      notifications.show({ title: "Успешно", message: "Параметр перемещен вверх." });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось переместить параметр.",
        color: "red",
      });
    }
  };

  const moveParamDown = async (paramId: number) => {
    const targetParam = await db.blockParameters.get(paramId);
    if (!targetParam) return;

    let siblings = paramList;
    if (targetParam.groupUuid) {
      siblings = paramList?.filter(
        (p) => p.groupUuid === targetParam.groupUuid && p.blockUuid === targetParam.blockUuid
      );
    } else {
      siblings = paramList?.filter((p) => !p.groupUuid && p.blockUuid === targetParam.blockUuid);
    }

    if (!siblings) return;

    const currentIndex = siblings.findIndex((p) => p.id === paramId);

    if (currentIndex === -1 || currentIndex >= siblings.length - 1) {
      notifications.show({
        title: "Информация",
        message: "Параметр уже внизу списка.",
      });
      return;
    }

    const succeedingParam = siblings[currentIndex + 1];

    try {
      await BlockParameterRepository.moveParamDown(db, paramId);
      notifications.show({ title: "Успешно", message: "Параметр перемещен вниз." });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось переместить параметр.",
        color: "red",
      });
    }
  };

  const saveParamGroup = async (data: IBlockParameterGroup) => {
    try {
      if (!data.uuid) {
        data.uuid = generateUUID();
        await db.blockParameterGroups.add(data);
        notifications.show({
          title: "Успешно",
          message: `Вкладка "${data.title}" добавлена`,
        });
        return;
      }
      await db.blockParameterGroups.update(data.id, data);
      notifications.show({
        title: "Успешно",
        message: `Вкладка "${data.title}" обновлена`,
      });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось сохранить вкладку",
        color: "red",
      });
    }
  };

  const moveGroupUp = async (groupUuid: string) => {
    await BlockParameterRepository.moveGroupUp(db, blockUuid, groupUuid);
  };

  const moveGroupDown = async (groupUuid: string) => {
    await BlockParameterRepository.moveGroupDown(db, blockUuid, groupUuid);
  };

  const updateGroupTitle = async (groupUuid: string, newTitle: string) => {
    try {
      const group = await BlockParameterRepository.getGroupByUuid(db, groupUuid);

      if (group) {
        await db.blockParameterGroups.update(group.id!, {
          title: newTitle,
        });
        notifications.show({
          title: "Успешно",
          message: `Название вкладки изменено на "${newTitle}"`,
        });
      }
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось изменить название вкладки",
        color: "red",
      });
    }
  };

  const deleteGroup = async (groupUuid: string) => {
    try {
      await BlockParameterRepository.deleteParameterGroup(db, blockUuid, groupUuid);

      notifications.show({
        title: "Успешно",
        message: "Вкладка и связанные параметры удалены",
      });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось удалить вкладку",
      });
    }
  };

  const loadPossibleValues = async (parameterUuid: string) => {
    return BlockParameterRepository.getParamPossibleValues(db, parameterUuid);
  };

  const savePossibleValues = async (parameterUuid: string, values: string[]) => {
    try {
      await BlockParameterRepository.updateParamPossibleValues(db, parameterUuid, values);

      notifications.show({
        title: "Успешно",
        message: "Значения списка сохранены",
      });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось сохранить значения списка",
        color: "red",
      });
    }
  };

  return {
    paramGroupList,
    paramList,
    saveParamGroup,
    saveParam,
    deleteParam,
    moveGroupUp,
    moveGroupDown,
    updateGroupTitle,
    deleteGroup,
    moveParamUp,
    moveParamDown,
    loadPossibleValues,
    savePossibleValues,
  };
};
