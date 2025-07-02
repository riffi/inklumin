import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import moment from "moment";
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

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useNotesServerSync = (token: string | undefined) => {
  useEffect(() => {
    if (!token) return;

    const syncNotes = async () => {
      try {
        const response = await inkLuminAPI.getNotesMeta(token);
        if (!response || !response.data) {
          return;
        }

        const serverDate = moment(response.data.updatedAt);
        const localMeta = await NoteMetaRepository.getMeta();
        const localDate = localMeta?.localUpdatedAt
          ? moment(localMeta.localUpdatedAt)
          : moment(0);

        if (serverDate.unix() > localDate.unix()) {
          await NoteMetaRepository.updateMeta({
            serverUpdatedAt: response.data.updatedAt,
            syncState: "serverChanges",
          });
        } else if (localMeta?.syncState !== "localChanges") {
          if (localMeta?.syncState !== "synced") {
            await NoteMetaRepository.updateMeta({ syncState: "synced" });
          }
        }
      } catch (error) {
        console.error("Error during notes sync:", error);
      }
    };

    syncNotes();
    const intervalId = setInterval(syncNotes, SYNC_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token]);
};
