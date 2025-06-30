import { BlockAbstractDb } from "@/entities/BlockAbstractDb";
import { BookDB } from "@/entities/bookDb";
import {
  IBlock, // Needed for appendDefaultParamGroup
  IBlockParameter,
  IBlockParameterDataType,
  IBlockParameterPossibleValue,
} from "@/entities/ConstructorEntities";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";
import { generateUUID } from "@/utils/UUIDUtils";

const getParameterGroups = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameterGroups.where("blockUuid").equals(blockUuid).sortBy("orderNumber");
};

const getGroupByUuid = async (db: BlockAbstractDb, groupUuid: string) => {
  return db.blockParameterGroups.where("uuid").equals(groupUuid).first();
};

const getParamPossibleValues = async (db: BlockAbstractDb, parameterUuid: string) => {
  return db.blockParameterPossibleValues
    .where("parameterUuid")
    .equals(parameterUuid)
    .sortBy("orderNumber");
};

const getAllParameters = async (db: BlockAbstractDb) => {
  return db.blockParameters.toArray();
};

const getByUuid = async (db: BlockAbstractDb, uuid: string) => {
  return db.blockParameters.where("uuid").equals(uuid).first();
};

const getByUuidList = async (db: BlockAbstractDb, uuids: string[]) => {
  return db.blockParameters.where("uuid").anyOf(uuids).toArray();
};

const getReferencingParamsToBlock = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameters.where("linkedBlockUuid").equals(blockUuid).toArray();
};

const getGroupingParameter = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameters
    .where({ blockUuid, dataType: IBlockParameterDataType.blockLink })
    .filter((p) => p.useForInstanceGrouping === 1)
    .first();
};

const getDisplayedParameters = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameters
    .where("blockUuid")
    .equals(blockUuid)
    .and((param) => param.displayInCard === 1)
    .toArray();
};

const getDefaultParameters = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameters
    .where({
      blockUuid,
      isDefault: 1,
    })
    .toArray();
};

const getParamsByGroup = async (db: BlockAbstractDb, groupUuid: string) => {
  return db.blockParameters.where("groupUuid").equals(groupUuid).toArray();
};

const deleteParameterGroup = async (db: BlockAbstractDb, blockUuid: string, groupUuid: string) => {
  // Удаляем все параметры, связанные с этой группой
  await db.blockParameters.where("groupUuid").equals(groupUuid).delete();

  // Удаляем группу
  await db.blockParameterGroups.where("uuid").equals(groupUuid).delete();

  // Обновляем порядковые номера для оставшихся групп
  const remainingGroups = await db.blockParameterGroups
    .where("blockUuid")
    .equals(blockUuid)
    .sortBy("orderNumber");

  await Promise.all(
    remainingGroups.map((group, index) =>
      db.blockParameterGroups.update(group.id!, {
        orderNumber: index,
      })
    )
  );
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const updateParamPossibleValues = async (
  db: BlockAbstractDb,
  parameterUuid: string,
  possibleValues: string[]
) => {
  // Changed type to string[]
  // Удаляем старые значения
  await db.blockParameterPossibleValues.where("parameterUuid").equals(parameterUuid).delete();

  // Сохраняем новые значения
  await Promise.all(
    possibleValues.map(
      (
        val,
        index // val is now a string
      ) =>
        db.blockParameterPossibleValues.add({
          uuid: generateUUID(),
          parameterUuid,
          value: val, // Use val here
          orderNumber: index,
        })
    )
  );
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const appendDefaultParamGroup = async (db: BlockAbstractDb, blockData: IBlock) => {
  await db.blockParameterGroups.add({
    blockUuid: blockData.uuid,
    uuid: generateUUID(),
    orderNumber: 0,
    description: "",
    title: "Основное",
  });
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const getReferencingParametersFromBlock = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameters
    .filter(
      (param) =>
        param.blockUuid === blockUuid && param.dataType === IBlockParameterDataType.blockLink
    )
    .toArray();
};

const moveGroupUp = async (db: BlockAbstractDb, blockUuid: string, groupUuid: string) => {
  const groups = await getParameterGroups(db, blockUuid);
  const index = groups.findIndex((g) => g.uuid === groupUuid);
  if (index > 0) {
    const prev = groups[index - 1];
    const curr = groups[index];
    await Promise.all([
      db.blockParameterGroups.update(prev.id!, { orderNumber: curr.orderNumber }),
      db.blockParameterGroups.update(curr.id!, { orderNumber: prev.orderNumber }),
    ]);
    if (db instanceof BookDB) {
      await updateBookLocalUpdatedAt(db as BookDB);
    }
  }
};

const moveGroupDown = async (db: BlockAbstractDb, blockUuid: string, groupUuid: string) => {
  const groups = await getParameterGroups(db, blockUuid);
  const index = groups.findIndex((g) => g.uuid === groupUuid);
  if (index >= 0 && index < groups.length - 1) {
    const curr = groups[index];
    const next = groups[index + 1];
    await Promise.all([
      db.blockParameterGroups.update(next.id!, { orderNumber: curr.orderNumber }),
      db.blockParameterGroups.update(curr.id!, { orderNumber: next.orderNumber }),
    ]);
    if (db instanceof BookDB) {
      await updateBookLocalUpdatedAt(db as BookDB);
    }
  }
};

const moveParamUp = async (db: BlockAbstractDb, paramId: number) => {
  const targetParam = await db.blockParameters.get(paramId);
  if (!targetParam) return;

  let siblings: IBlockParameter[] = [];
  if (targetParam.groupUuid) {
    siblings = await db.blockParameters
      .where("groupUuid")
      .equals(targetParam.groupUuid)
      .sortBy("orderNumber");
  } else {
    siblings = await db.blockParameters
      .where("blockUuid")
      .equals(targetParam.blockUuid)
      .filter((p) => !p.groupUuid)
      .toArray();
    siblings.sort((a, b) => a.orderNumber - b.orderNumber);
  }

  const index = siblings.findIndex((p) => p.id === paramId);
  if (index > 0) {
    const prev = siblings[index - 1];
    const curr = siblings[index];
    await db.blockParameters.bulkPut([
      { ...prev, orderNumber: curr.orderNumber },
      { ...curr, orderNumber: prev.orderNumber },
    ]);
    if (db instanceof BookDB) {
      await updateBookLocalUpdatedAt(db as BookDB);
    }
  }
};

const moveParamDown = async (db: BlockAbstractDb, paramId: number) => {
  const targetParam = await db.blockParameters.get(paramId);
  if (!targetParam) return;

  let siblings: IBlockParameter[] = [];
  if (targetParam.groupUuid) {
    siblings = await db.blockParameters
      .where("groupUuid")
      .equals(targetParam.groupUuid)
      .sortBy("orderNumber");
  } else {
    siblings = await db.blockParameters
      .where("blockUuid")
      .equals(targetParam.blockUuid)
      .filter((p) => !p.groupUuid)
      .toArray();
    siblings.sort((a, b) => a.orderNumber - b.orderNumber);
  }

  const index = siblings.findIndex((p) => p.id === paramId);
  if (index >= 0 && index < siblings.length - 1) {
    const curr = siblings[index];
    const next = siblings[index + 1];
    await db.blockParameters.bulkPut([
      { ...next, orderNumber: curr.orderNumber },
      { ...curr, orderNumber: next.orderNumber },
    ]);
    if (db instanceof BookDB) {
      await updateBookLocalUpdatedAt(db as BookDB);
    }
  }
};

const saveParam = async (db: BlockAbstractDb, blockUuid: string, param: IBlockParameter) => {
  if (!param.id) {
    const newParam: IBlockParameter = {
      ...param,
      uuid: param.uuid || generateUUID(),
      blockUuid,
      userDocPageUuid: param.userDocPageUuid ?? undefined,
    };
    await db.blockParameters.add(newParam);
  } else {
    const prevData = await db.blockParameters.get(param.id);
    const updated: IBlockParameter = {
      ...param,
      userDocPageUuid: param.userDocPageUuid ?? undefined,
    };
    await db.blockParameters.update(param.id, updated);

    if (db instanceof BookDB && prevData && prevData.isDefault === 0 && param.isDefault === 1) {
      const block = await db.blocks.where("uuid").equals(blockUuid).first();
      if (block?.structureKind === "single") {
        const instances = await (db as BookDB).blockInstances
          .where("blockUuid")
          .equals(blockUuid)
          .toArray();
        for (const inst of instances) {
          await (db as BookDB).blockParameterInstances.add({
            uuid: generateUUID(),
            blockInstanceUuid: inst.uuid!,
            blockParameterUuid: param.uuid!,
            blockParameterGroupUuid: param.groupUuid,
            value: "",
            linkedBlockUuid: param.dataType === IBlockParameterDataType.blockLink ? "" : undefined,
          });
          await (db as BookDB).blockInstances.update(inst.id!, {
            ...inst,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const deleteParam = async (db: BlockAbstractDb, paramId: number) => {
  const param = await db.blockParameters.get(paramId);
  if (!param) return;

  await db.blockParameters.delete(paramId);

  let remaining: IBlockParameter[] = [];
  if (param.groupUuid) {
    remaining = await db.blockParameters
      .where("groupUuid")
      .equals(param.groupUuid)
      .sortBy("orderNumber");
  } else {
    remaining = await db.blockParameters
      .where("blockUuid")
      .equals(param.blockUuid)
      .filter((p) => !p.groupUuid)
      .toArray();
    remaining.sort((a, b) => a.orderNumber - b.orderNumber);
  }

  await Promise.all(
    remaining.map((p, index) => db.blockParameters.update(p.id!, { orderNumber: index }))
  );

  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

export const BlockParameterRepository = {
  getParameterGroups,
  getParamsByGroup,
  getGroupByUuid,
  getParamPossibleValues,
  getAllParameters,
  getByUuid,
  getByUuidList,
  getReferencingParamsToBlock,
  getGroupingParameter,
  getDisplayedParameters,
  getDefaultParameters,
  deleteParameterGroup,
  updateParamPossibleValues,
  appendDefaultParamGroup,
  getReferencingParametersFromBlock,
  moveGroupUp,
  moveGroupDown,
  moveParamUp,
  moveParamDown,
  saveParam,
  deleteParam,
};
