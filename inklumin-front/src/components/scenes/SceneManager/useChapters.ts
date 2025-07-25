import { useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { IChapter } from "@/entities/BookEntities";
import { SceneService } from "@/services/sceneService";
import { useBookStore } from "@/stores/bookStore/bookStore";

export const useChapters = (chapters?: IChapter[]) => {
  const { selectedBook } = useBookStore();
  const chapterOnlyMode = selectedBook?.chapterOnlyMode === 1;

  const createChapter = useCallback(
    async (title: string) => {
      const result = await SceneService.createChapter(title, chapterOnlyMode);
      if (result.success) {
        notifications.show({ title: "Успех", message: "Глава успешно создана", color: "green" });
        return result.data;
      } else {
        notifications.show({ title: "Ошибка", message: "Не удалось создать главу", color: "red" });
        return undefined;
      }
    },
    [chapterOnlyMode]
  );

  const deleteChapter = useCallback(async (chapterId: number) => {
    const result = await SceneService.deleteChapter(chapterId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Глава удалена", color: "green" });
      return true;
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось удалить главу", color: "red" });
      return false;
    }
  }, []);

  const updateChapterOrder = useCallback(async (chapterId: number, newOrder: number) => {
    const result = await SceneService.updateChapterOrder(chapterId, newOrder);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Порядок глав обновлен", color: "green" });
    } else {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось обновить порядок глав",
        color: "red",
      });
    }
  }, []);

  const reorderChapters = useCallback(async (activeId: number, overId: number) => {
    const result = await SceneService.reorderChapters(activeId, overId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Порядок глав изменен", color: "green" });
    } else {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось изменить порядок глав",
        color: "red",
      });
    }
  }, []);

  const addSceneToChapter = useCallback(async (sceneId: number, chapterId: number) => {
    const result = await SceneService.addSceneToChapter(sceneId, chapterId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Сцена добавлена в главу", color: "green" });
    } else {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось добавить сцену в главу",
        color: "red",
      });
    }
  }, []);

  const removeSceneFromChapter = useCallback(async (sceneId: number) => {
    const result = await SceneService.removeSceneFromChapter(sceneId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Сцена удалена из главы", color: "green" });
    } else {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось удалить сцену из главы",
        color: "red",
      });
    }
  }, []);

  const updateChapter = useCallback(async (chapterId: number, title: string) => {
    const result = await SceneService.updateChapter(chapterId, title);
    if (result.success) {
      notifications.show({ title: "Успех", message: "Глава успешно обновлена", color: "green" });
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось обновить главу", color: "red" });
    }
  }, []);

  return {
    chapters,
    createChapter,
    deleteChapter,
    reorderChapters,
    updateChapterOrder,
    addSceneToChapter,
    removeSceneFromChapter,
    updateChapter,
  };
};
