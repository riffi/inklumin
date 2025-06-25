import { BlockAbstractDb } from "@/entities/BlockAbstractDb";
import { BookDB } from "@/entities/bookDb";
import { IBlock, IBlockRelation } from "@/entities/ConstructorEntities"; // Added IBlock

import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";
import { generateUUID } from "@/utils/UUIDUtils";

const getBlockRelations = async (db: BlockAbstractDb, blockUuid: string) => {
  const [targetRelations, sourceRelations] = await Promise.all([
    db.blocksRelations.where({ sourceBlockUuid: blockUuid }).toArray(),
    db.blocksRelations.where({ targetBlockUuid: blockUuid }).toArray(),
  ]);

  return [...targetRelations, ...sourceRelations];
};

const getAllRelations = async (db: BlockAbstractDb) => {
  return db.blocksRelations.toArray();
};

const save = async (db: BlockAbstractDb, relation: IBlockRelation) => {
  if (!relation.uuid) {
    relation.uuid = generateUUID();
    await db.blocksRelations.add(relation);
  } else {
    const existing = await db.blocksRelations.where("uuid").equals(relation.uuid).first();
    if (existing) {
      await db.blocksRelations.update(existing.id!, relation);
    }
  }
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};
const remove = async (db: BlockAbstractDb, blockRelationUuid: string) => {
  const relation = await db.blocksRelations.where({ uuid: blockRelationUuid }).first();
  if (!relation) return;

  // Удаляем все связанные вкладки
  const blockTabs = await db.blockTabs.where({ relationUuid: blockRelationUuid }).toArray();
  for (const blockTab of blockTabs) {
    await db.blockTabs.where({ uuid: blockTab.uuid }).delete();
  }

  // Удаляем саму связь
  await db.blocksRelations.where({ uuid: blockRelationUuid }).delete();
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const getRelatedBlocks = async (
  db: BlockAbstractDb,
  block: IBlock,
  blockRelations?: IBlockRelation[]
) => {
  const relations: IBlockRelation[] = [];
  if (!blockRelations) {
    relations.push(...(await getBlockRelations(db, block.uuid))); // Changed to direct call
  } else {
    relations.push(...blockRelations);
  }
  return db.blocks
    .where({
      // This accesses db.blocks table
      configurationUuid: block?.configurationUuid,
    })
    .filter((b) => b.uuid !== block.uuid)
    .filter((b) =>
      relations.some((r) => r.sourceBlockUuid === b.uuid || r.targetBlockUuid === b.uuid)
    )
    .toArray();
};

export const BlockRelationRepository = {
  getBlockRelations,
  getAllRelations,
  remove,
  save,
  getRelatedBlocks, // Added
};
