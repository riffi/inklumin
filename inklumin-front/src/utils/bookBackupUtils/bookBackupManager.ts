import { notifications } from "@mantine/notifications";
import {
  BackupData,
  collectBookBackupData,
  importBookData,
} from "@/repository/Book/BookBackupRepository";

export type { BackupData } from "@/repository/Book/BookBackupRepository";

// Вспомогательная функция для показа уведомлений об ошибках
const showErrorNotification = (message: string, error?: any) => {
  const errorMessage = error?.message ? `${message}: ${error.message}` : message;
  notifications.show({
    message: errorMessage,
    color: "red",
  });
};

export const exportBook = async (bookUuid: string) => {
  try {
    const backupData = await collectBookBackupData(bookUuid);

    const blob = new Blob([JSON.stringify(backupData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-backup-${backupData.book.title}-${Date.now()}.inklumin`;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    showErrorNotification("Ошибка экспорта", error);
    return false;
  }
};

export const importBookBackup = async (file: File) => {
  try {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const backupData: BackupData = JSON.parse(event.target?.result as string);
          await importBookData(backupData);

          notifications.show({
            message: "Произведение успешно импортировано",
            color: "green",
          });
          resolve(true);
        } catch (error) {
          showErrorNotification("Ошибка импорта", error);
          reject(error);
        }
      };

      reader.readAsText(file);
    });
  } catch (error) {
    showErrorNotification("Ошибка импорта", error);
    return false;
  }
};

export const handleFileImport = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  return new Promise((resolve) => {
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file ? await importBookBackup(file) : false);
    };
    input.click();
  });
};
