import { bookDb } from "@/entities/bookDb";
import { IScene } from "@/entities/BookEntities";
import { ChapterRepository } from "@/repository/Scene/ChapterRepository";
import { SceneRepository } from "@/repository/Scene/SceneRepository";

export interface ServiceResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

async function createScene(title: string, chapterId?: number): Promise<ServiceResult<number>> {
  try {
    const sceneData: IScene = {
      title,
      body: "",
      order: 0,
      chapterId: chapterId ?? null,
    } as IScene;
    const id = await SceneRepository.create(bookDb, sceneData);
    if (id === undefined) throw new Error("Failed to create scene");
    return { success: true, data: id };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function deleteScene(sceneId: number): Promise<ServiceResult> {
  try {
    await SceneRepository.remove(bookDb, sceneId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function updateSceneOrder(sceneId: number, newOrder: number): Promise<ServiceResult> {
  try {
    await SceneRepository.updateOrder(bookDb, sceneId, newOrder);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function reorderScenes(activeId: number, overId: number): Promise<ServiceResult> {
  try {
    await SceneRepository.swapOrder(bookDb, activeId, overId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function updateScene(sceneId: number, sceneData: Partial<IScene>): Promise<ServiceResult> {
  try {
    await SceneRepository.update(bookDb, sceneId, sceneData);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function recalculateGlobalOrder(params?: {
  id: number;
  newChapterId: number | null;
}): Promise<ServiceResult> {
  try {
    await SceneRepository.recalculateGlobalOrder(bookDb, params);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function addSceneToChapter(sceneId: number, chapterId: number): Promise<ServiceResult> {
  try {
    await SceneRepository.addSceneToChapter(bookDb, sceneId, chapterId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function removeSceneFromChapter(sceneId: number): Promise<ServiceResult> {
  try {
    await SceneRepository.removeSceneFromChapter(bookDb, sceneId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function createChapter(
  title: string,
  chapterOnlyMode: boolean
): Promise<ServiceResult<{ chapterId: number; sceneId?: number }>> {
  try {
    const chapterId = await ChapterRepository.create(bookDb, { title }, chapterOnlyMode);
    if (chapterId === undefined) throw new Error("Failed to create chapter");

    const createdChapter = await ChapterRepository.getById(bookDb, chapterId);
    return {
      success: true,
      data: { chapterId, sceneId: createdChapter?.contentSceneId },
    };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function deleteChapter(chapterId: number): Promise<ServiceResult> {
  try {
    const chapter = await ChapterRepository.getById(bookDb, chapterId);
    if (chapter?.contentSceneId !== undefined) {
      await SceneRepository.remove(bookDb, chapter.contentSceneId);
    }

    await ChapterRepository.remove(bookDb, chapterId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function updateChapterOrder(chapterId: number, newOrder: number): Promise<ServiceResult> {
  try {
    await ChapterRepository.update(bookDb, chapterId, { order: newOrder });
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function reorderChapters(activeId: number, overId: number): Promise<ServiceResult> {
  try {
    await ChapterRepository.reorderChapters(bookDb, activeId, overId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function updateChapter(chapterId: number, title: string): Promise<ServiceResult> {
  try {
    await ChapterRepository.update(bookDb, chapterId, { title });

    const chapter = await ChapterRepository.getById(bookDb, chapterId);
    if (chapter?.contentSceneId !== undefined) {
      await SceneRepository.update(bookDb, chapter.contentSceneId, { title });
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function saveScene(
  sceneId: number | null | undefined,
  data: IScene
): Promise<ServiceResult<number>> {
  try {
    if (sceneId === null || sceneId === undefined) {
      const creationData = { ...data } as IScene;
      delete (creationData as any).id;
      const newId = await SceneRepository.create(bookDb, creationData);
      if (newId === undefined) throw new Error("Failed to create scene");
      return { success: true, data: newId };
    } else {
      await SceneRepository.update(bookDb, sceneId, data);
      return { success: true, data: sceneId };
    }
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export const SceneService = {
  createScene,
  deleteScene,
  updateSceneOrder,
  reorderScenes,
  updateScene,
  recalculateGlobalOrder,
  addSceneToChapter,
  removeSceneFromChapter,
  createChapter,
  deleteChapter,
  updateChapterOrder,
  reorderChapters,
  updateChapter,
  saveScene,
};

export type { ServiceResult };
