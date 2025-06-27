import { notifications } from "@mantine/notifications";
import { IScene } from "@/entities/BookEntities";
import { SceneService } from "@/services/sceneService";
import { useCallback, useMemo } from "react";

export const useScenes = (scenes?: IScene[]) => {
  const createScene = useCallback(async (title: string, chapterId?: number) => {
    const result = await SceneService.createScene(title, chapterId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Сцена создана", color: "green" });
      return result.data;
    }

    notifications.show({ title: "Ошибка", message: "Не удалось создать сцену", color: "red" });
    return undefined;
  }, []);

  const deleteScene = useCallback(async (sceneId: number) => {
    const result = await SceneService.deleteScene(sceneId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Сцена удалена", color: "green" });
      return true;
    }

    notifications.show({ title: "Ошибка", message: "Не удалось удалить сцену", color: "red" });
    return false;
  }, []);

  const updateSceneOrder = useCallback(async (sceneId: number, newOrder: number) => {
    const result = await SceneService.updateSceneOrder(sceneId, newOrder);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Порядок сцен обновлен", color: "green" });
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось обновить порядок сцен", color: "red" });
    }
  }, []);

  const updateScene = useCallback(async (sceneId: number, sceneData: Partial<IScene>) => {
    const result = await SceneService.updateScene(sceneId, sceneData);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Сцена обновлена", color: "green" });
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось обновить сцену", color: "red" });
    }
  }, []);

  const reorderScenes = useCallback(async (activeId: number, overId: number) => {
    const result = await SceneService.reorderScenes(activeId, overId);
    if (result.success) {
      notifications.show({ title: "Успешно", message: "Порядок сцен изменен", color: "green" });
    } else {
      notifications.show({ title: "Ошибка", message: "Не удалось изменить порядок сцен", color: "red" });
    }
  }, []);

  return useMemo(
      () => ({
        scenes,
        deleteScene,
        reorderScenes,
        updateSceneOrder,
        createScene,
        updateScene,
      }),
      [scenes, deleteScene, reorderScenes, updateSceneOrder, createScene, updateScene]
  );
};
