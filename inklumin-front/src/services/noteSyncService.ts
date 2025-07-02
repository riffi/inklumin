import { notifications } from "@mantine/notifications";
import { inkLuminAPI } from "@/api/inkLuminApi/inkLuminApi";
import { NoteBackupRepository } from "@/repository/Note/NoteBackupRepository";
import { NoteMetaRepository } from "@/repository/Note/NoteMetaRepository";

export const saveNotesToServer = async (token: string) => {
  try {
    const data = await NoteBackupRepository.collectNotesBackupData();
    const response = await inkLuminAPI.saveNotesData(token, data);
    if (response.success) {
      await NoteMetaRepository.updateMeta({
        serverUpdatedAt: response.data.updatedAt,
        localUpdatedAt: response.data.updatedAt,
        syncState: "synced",
      });
      notifications.show({ message: "Заметки сохранены на сервер", color: "green" });
      return true;
    }
    throw new Error(response.message || "Ошибка сохранения");
  } catch (e: any) {
    notifications.show({ message: `Ошибка сохранения: ${e.message || ""}`, color: "red" });
    return false;
  }
};

export const loadNotesFromServer = async (token: string) => {
  try {
    const response = await inkLuminAPI.getNotesData(token);
    if (!response.success || !response.data) throw new Error(response.message || "Ошибка загрузки");
    const backupData = JSON.parse(response.data.notesData);
    backupData.meta = {
      serverUpdatedAt: response.data.updatedAt,
    };
    await NoteBackupRepository.importNotesData(backupData);
    notifications.show({ message: "Заметки загружены с сервера", color: "green" });
    return true;
  } catch (e: any) {
    notifications.show({ message: `Ошибка загрузки: ${e.message || ""}`, color: "red" });
    return false;
  }
};
