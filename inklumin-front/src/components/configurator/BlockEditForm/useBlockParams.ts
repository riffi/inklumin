import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { bookDb } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";
import {
  IBlockParameter,
  IBlockParameterGroup,
  IBlockStructureKind,
} from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { generateUUID } from "@/utils/UUIDUtils";
import type { BookDB } from "@/entities/bookDb";

export const useBlockParams = (
  blockUuid: string,
  bookUuid?: string,
  currentGroupUuid?: string,
) => {
  const db = bookUuid ? bookDb : configDatabase;
  const isBookDb = !!bookUuid;

  const paramGroupList = useLiveQuery<IBlockParameterGroup[]>(() => {
    if (!blockUuid || !db) {
      return;
    }
    return db.blockParameterGroups
      .where("blockUuid")
      .equals(blockUuid)
      .sortBy("orderNumber");
  }, [blockUuid, db]);

  const paramList = useLiveQuery<IBlockParameter[]>(() => {
    if (currentGroupUuid) {
      return db.blockParameters
        .where({ groupUuid: currentGroupUuid, blockUuid })
        .sortBy("orderNumber");
    }
    return db.blockParameters
      .where({ blockUuid })
      .sortBy("orderNumber");
  }, [blockUuid, currentGroupUuid]);

  const saveParam = async (param: IBlockParameter) => {
    if (!param.id) {
      param.uuid = generateUUID();
      param.groupUuid = currentGroupUuid;
      param.orderNumber = paramList?.length;
      param.blockUuid = blockUuid;
      const paramToSave: IBlockParameter = {
        ...param,
        knowledgeBasePageUuid: param.knowledgeBasePageUuid ?? undefined,
      };
      db.blockParameters.add(paramToSave);
    } else {
      const prevData = await db.blockParameters.get(param.id);
      const paramToUpdate: IBlockParameter = {
        ...param,
        knowledgeBasePageUuid: param.knowledgeBasePageUuid ?? undefined,
      };
      db.blockParameters.update(param.id, paramToUpdate);

      if (isBookDb && prevData && prevData.isDefault === 0 && param.isDefault === 1) {
        const block = await BlockRepository.getByUuid(db, blockUuid);
        if (block?.structureKind === IBlockStructureKind.single) {
          const instances = await BlockInstanceRepository.getBlockInstances(
            db as BookDB,
            blockUuid,
          );
          for (const instance of instances) {
            await BlockParameterInstanceRepository.appendDefaultParam(
              db as BookDB,
              instance,
              param,
            );
          }
        }
      }
    }
  };

  const deleteParam = async (paramId: number) => {
    try {
      await db.blockParameters.delete(paramId);
      notifications.show({
        title: "Успешно",
        message: "Параметр удалён",
      });

      if (currentGroupUuid) {
        const remainingParams = await db.blockParameters
          .where("groupUuid")
          .equals(currentGroupUuid)
          .sortBy("orderNumber");

        await Promise.all(
          remainingParams.map((param, index) =>
            db.blockParameters.update(param.id!, {
              orderNumber: index,
            }),
          ),
        );
      }
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
        (p) => p.groupUuid === targetParam.groupUuid && p.blockUuid === targetParam.blockUuid,
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

    const precedingParam = siblings[currentIndex - 1];

    const currentOrder = targetParam.orderNumber;
    targetParam.orderNumber = precedingParam.orderNumber;
    precedingParam.orderNumber = currentOrder;

    try {
      await db.blockParameters.bulkPut([targetParam, precedingParam]);
      notifications.show({
        title: "Успешно",
        message: "Параметр перемещен вверх.",
      });
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
        (p) => p.groupUuid === targetParam.groupUuid && p.blockUuid === targetParam.blockUuid,
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

    const currentOrder = targetParam.orderNumber;
    targetParam.orderNumber = succeedingParam.orderNumber;
    succeedingParam.orderNumber = currentOrder;

    try {
      await db.blockParameters.bulkPut([targetParam, succeedingParam]);
      notifications.show({
        title: "Успешно",
        message: "Параметр перемещен вниз.",
      });
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
    const groups = await BlockParameterRepository.getParameterGroups(db, blockUuid);

    const currentIndex = groups.findIndex((g) => g.uuid === groupUuid);
    if (currentIndex <= 0) return;

    const previousGroup = groups[currentIndex - 1];
    const currentGroup = groups[currentIndex];

    await db.blockParameterGroups.update(previousGroup.id!, {
      orderNumber: currentGroup.orderNumber,
    });
    await db.blockParameterGroups.update(currentGroup.id!, {
      orderNumber: previousGroup.orderNumber,
    });
  };

  const moveGroupDown = async (groupUuid: string) => {
    const groups = await db.blockParameterGroups
      .where("blockUuid")
      .equals(blockUuid)
      .sortBy("orderNumber");

    const currentIndex = groups.findIndex((g) => g.uuid === groupUuid);
    if (currentIndex === -1 || currentIndex >= groups.length - 1) return;

    const nextGroup = groups[currentIndex + 1];
    const currentGroup = groups[currentIndex];

    await db.blockParameterGroups.update(nextGroup.id!, {
      orderNumber: currentGroup.orderNumber,
    });
    await db.blockParameterGroups.update(currentGroup.id!, {
      orderNumber: nextGroup.orderNumber,
    });
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
