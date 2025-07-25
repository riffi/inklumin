import { BookDB } from "@/entities/bookDb";
import { IScene } from "@/entities/BookEntities";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";

export const getById = async (db: BookDB, sceneId: number): Promise<IScene | undefined> => {
  const scene = await db.scenes.get(sceneId);
  if (!scene) return undefined;
  const body = await db.sceneBodies.where("sceneId").equals(sceneId).first();
  return { ...scene, body: body?.body ?? "" } as IScene;
};

export const getAll = async (db: BookDB): Promise<IScene[]> => {
  const scenes = await db.scenes.orderBy("order").toArray();
  return scenes;
  // const bodies = await db.sceneBodies.toArray();
  // const bodyMap = new Map(bodies.map(b => [b.sceneId, b.body]));
  // return scenes.map(s => ({ ...s, body: bodyMap.get(s.id!) || '' } as IScene));
};

export const getBodyById = async (db: BookDB, sceneId: number): Promise<string | undefined> => {
  const body = await db.sceneBodies.where("sceneId").equals(sceneId).first();
  return body?.body;
};

export const getAllBodies = async (db: BookDB) => {
  return db.sceneBodies.toArray();
};

export const getByChapterId = async (db: BookDB, chapterId: number): Promise<IScene[]> => {
  const scenes = await db.scenes.where("chapterId").equals(chapterId).toArray();
  const ids = scenes.map((s) => s.id!);
  const bodies = await db.sceneBodies.where("sceneId").anyOf(ids).toArray();
  const bodyMap = new Map(bodies.map((b) => [b.sceneId, b.body]));
  return scenes.map((s) => ({ ...s, body: bodyMap.get(s.id!) || "" }) as IScene);
};

export const create = async (db: BookDB, sceneData: IScene): Promise<number | undefined> => {
  const { body, ...sceneToCreate } = sceneData;
  delete (sceneToCreate as any).id;

  sceneToCreate.order = sceneToCreate.order === undefined ? 0 : sceneToCreate.order;

  const newSceneId = await db.scenes.add(sceneToCreate as any);
  if (newSceneId !== undefined) {
    await db.sceneBodies.add({ sceneId: newSceneId, body: body || "" });
    await recalculateGlobalOrder(db, { id: newSceneId, newChapterId: sceneData.chapterId ?? null });
  }
  await updateBookLocalUpdatedAt(db);
  return newSceneId;
};

export const update = async (
  db: BookDB,
  sceneId: number,
  sceneData: Partial<IScene>
): Promise<void> => {
  const existingScene = await getById(db, sceneId);
  if (!existingScene) {
    console.error(`Scene with id ${sceneId} not found for update.`);
    return; // Or throw an error
  }

  const { body, ...sceneChanges } = sceneData;
  if (Object.keys(sceneChanges).length) {
    await db.scenes.update(sceneId, sceneChanges);
  }
  if (body !== undefined) {
    await db.sceneBodies.where("sceneId").equals(sceneId).modify({ body });
  }

  await updateBookLocalUpdatedAt(db);

  // Check if order or chapterId changed and if recalculation is needed
  const newOrder = sceneChanges.order;
  const newChapterId = sceneChanges.chapterId;

  const orderChanged = newOrder !== undefined && newOrder !== existingScene.order;
  // Ensure null and undefined are treated consistently for chapterId comparison
  const chapterIdChanged =
    newChapterId !== undefined && (newChapterId ?? null) !== (existingScene.chapterId ?? null);

  if (orderChanged || chapterIdChanged) {
    // If newChapterId was part of sceneData, use it, otherwise use existing scene's chapterId.
    // The newChapterId for recalculateGlobalOrder should be the chapter the scene is *now* in.
    const effectiveChapterId = newChapterId !== undefined ? newChapterId : existingScene.chapterId;
    await recalculateGlobalOrder(db, { id: sceneId, newChapterId: effectiveChapterId ?? null });
  }
};

export const remove = async (db: BookDB, sceneId: number): Promise<void> => {
  // Note: The original useScenes.deleteScene did not explicitly handle unlinking from chapters.
  // This was seemingly handled by useChapters.deleteChapter which moves scenes to root.
  // For now, we replicate the simple delete. If cascading deletes or unlinking is needed here,
  // it would be an adjustment.
  // However, recalculateGlobalOrder should handle fixing orders after a scene is removed.
  const sceneToRemove = await getById(db, sceneId);
  if (!sceneToRemove) return;

  await db.transaction("rw", [db.scenes, db.sceneBodies, db.blockInstanceSceneLinks], async () => {
    await db.scenes.delete(sceneId);
    await db.sceneBodies.where("sceneId").equals(sceneId).delete();
    await db.blockInstanceSceneLinks.where("sceneId").equals(sceneId).delete();
  });
  await updateBookLocalUpdatedAt(db);

  // Recalculate order for the chapter the scene belonged to, or globally if it was chapterless
  await recalculateGlobalOrder(db); // Recalculate all orders
};

export const updateOrder = async (db: BookDB, sceneId: number, newOrder: number): Promise<void> => {
  // This function updates a single scene's order.
  // It's crucial that after such an update, the global order is recalculated
  // to ensure consistency across all scenes, especially if this newOrder value
  // could conflict with existing orders or create gaps.
  await db.scenes.update(sceneId, { order: newOrder });
  await recalculateGlobalOrder(db); // Ensure data integrity
  await updateBookLocalUpdatedAt(db);
};

// New function to swap the 'order' property of two scenes
export const swapOrder = async (db: BookDB, activeId: number, overId: number): Promise<void> => {
  const activeScene = await db.scenes.get(activeId);
  const overScene = await db.scenes.get(overId);

  if (!activeScene || !overScene) {
    console.error("Cannot swap order: one or both scenes not found", { activeId, overId });
    // Consider throwing an error here or handling it more gracefully
    return;
  }

  const activeOrder = activeScene.order;
  const overOrder = overScene.order;

  // Prevent unnecessary writes if orders are somehow already the same
  if (activeOrder === overOrder) {
    return;
  }

  await db.transaction("rw", db.scenes, async () => {
    await db.scenes.update(activeId, { order: overOrder });
    await db.scenes.update(overId, { order: activeOrder });
  });
  // After a direct swap, it's possible that the overall order list might need adjustments
  // if other scenes' orders are expected to shift.
  // However, if this is a simple 1-to-1 swap of order numbers, this might be sufficient.
  // For drag-and-drop, often a full recalculateGlobalOrder is safer after the swap.
  // The prompt suggests this might be called by reorderScenes in useScenes.tsx,
  // which might then decide if a full recalculation is needed.
  // Let's call recalculateGlobalOrder to ensure consistency after a swap.
  await recalculateGlobalOrder(db);
  await updateBookLocalUpdatedAt(db);
};

export const recalculateGlobalOrder = async (
  db: BookDB,
  movedScene?: { id: number; newChapterId: number | null }
): Promise<void> => {
  // Adapted from useScenes.recalculateGlobalOrder
  const allScenes = await db.scenes.orderBy("order").toArray();

  let scenesToProcess = [...allScenes];
  let movedSceneData: IScene | undefined;

  if (movedScene && movedScene.id) {
    movedSceneData = scenesToProcess.find((s) => s.id === movedScene.id);
    if (movedSceneData) {
      // Temporarily remove from list to re-insert it later
      scenesToProcess = scenesToProcess.filter((s) => s.id !== movedScene.id);
      // Update chapterId for the moved scene
      movedSceneData.chapterId = movedScene.newChapterId;
    }
  }

  // Group scenes by chapterId and also collect chapterless scenes
  const scenesByChapter: Record<string, IScene[]> = {};
  const chapterlessScenes: IScene[] = [];

  for (const scene of scenesToProcess) {
    if (scene.chapterId !== null && scene.chapterId !== undefined) {
      if (!scenesByChapter[scene.chapterId]) {
        scenesByChapter[scene.chapterId] = [];
      }
      scenesByChapter[scene.chapterId].push(scene);
    } else {
      chapterlessScenes.push(scene);
    }
  }

  // If a scene was moved, add it to its new chapter group or chapterless group
  if (movedSceneData) {
    if (movedSceneData.chapterId !== null && movedSceneData.chapterId !== undefined) {
      if (!scenesByChapter[movedSceneData.chapterId]) {
        scenesByChapter[movedSceneData.chapterId] = [];
      }
      // Add to the end of its new chapter group
      scenesByChapter[movedSceneData.chapterId].push(movedSceneData);
    } else {
      // Add to the end of chapterless scenes
      chapterlessScenes.push(movedSceneData);
    }
  }

  let currentGlobalOrder = 1;
  const updates: { key: number; changes: Partial<IScene> }[] = [];

  // Process scenes within each chapter
  const sortedChapterIds = Object.keys(scenesByChapter)
    .map(Number)
    .sort((a, b) => {
      const chapterA = db.chapters.get(a);
      const chapterB = db.chapters.get(b);
      // This sort is problematic as db.chapters.get is async.
      // For now, we'll sort by chapterId numerically, assuming chapter order is handled elsewhere or chapter objects are fetched first.
      // A more robust solution would involve fetching chapters and their orders first.
      // For now, we rely on the existing order of scenes within chapters if not moving chapters themselves.
      return a - b; // Simplified sorting
    });

  // To correctly order chapters, we should fetch them first
  const allChapters = await db.chapters.orderBy("order").toArray();
  const chapterOrderMap = new Map(allChapters.map((ch) => [ch.id, ch.order]));

  sortedChapterIds.sort(
    (a, b) => (chapterOrderMap.get(a) ?? Infinity) - (chapterOrderMap.get(b) ?? Infinity)
  );

  for (const chapterId of sortedChapterIds) {
    const chapterScenes = scenesByChapter[chapterId];
    // Sort scenes within the chapter by their existing order, if stable sort is desired for non-moved items
    // For simplicity, if not moved, their relative order is preserved by iterating through `scenesToProcess`
    // When moving, the scene is added to the end.
    for (const scene of chapterScenes) {
      if (
        scene.order !== currentGlobalOrder ||
        (movedSceneData && scene.id === movedSceneData.id)
      ) {
        updates.push({
          key: scene.id!,
          changes: { order: currentGlobalOrder, chapterId: scene.chapterId },
        });
      }
      currentGlobalOrder++;
    }
  }

  // Process chapterless scenes
  // Sort chapterless scenes by their existing order if stable sort is desired
  for (const scene of chapterlessScenes) {
    if (scene.order !== currentGlobalOrder || (movedSceneData && scene.id === movedSceneData.id)) {
      updates.push({
        key: scene.id!,
        changes: { order: currentGlobalOrder, chapterId: null },
      });
    }
    currentGlobalOrder++;
  }

  await db.transaction("rw", db.scenes, async () => {
    if (updates.length > 0) {
      await db.scenes.bulkUpdate(updates);
    }
  });
  await updateBookLocalUpdatedAt(db);
};

export const addSceneToChapter = async (
  db: BookDB,
  sceneId: number,
  chapterId: number
): Promise<void> => {
  // Adapted from useChapters.addSceneToChapter
  await db.scenes.update(sceneId, { chapterId });
  // After changing a scene's chapter, orders need recalculation.
  await recalculateGlobalOrder(db, { id: sceneId, newChapterId: chapterId });
  await updateBookLocalUpdatedAt(db);
};

export const removeSceneFromChapter = async (db: BookDB, sceneId: number): Promise<void> => {
  // Adapted from useChapters.removeSceneFromChapter
  await db.scenes.update(sceneId, { chapterId: null });
  // After removing a scene from a chapter (making it chapterless), orders need recalculation.
  await recalculateGlobalOrder(db, { id: sceneId, newChapterId: null });
  await updateBookLocalUpdatedAt(db);
};

export const findByTitle = async (db: BookDB, title: string): Promise<IScene | undefined> => {
  const lower = title.toLowerCase();
  const scenes = await db.scenes.toArray();
  return scenes.find((s) => s.title.toLowerCase().includes(lower));
};

export const updateBody = async (db: BookDB, sceneId: number, body: string) => {
  await db.sceneBodies.where("sceneId").equals(sceneId).modify({ body });
  await updateBookLocalUpdatedAt(db);
};

export const SceneRepository = {
  getById,
  getAll,
  getBodyById,
  getAllBodies,
  getByChapterId,
  create,
  update,
  remove,
  updateOrder,
  swapOrder, // Add new function here
  recalculateGlobalOrder,
  addSceneToChapter,
  removeSceneFromChapter,
  findByTitle,
  updateBody,
};
