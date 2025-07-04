import { useEffect } from "react";
import moment from "moment";
import { notifications } from "@mantine/notifications";
import { inkLuminAPI } from "@/api/inkLuminApi/inkLuminApi";
import { IBook } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import {
  BackupData,
  collectBookBackupData,
  importBookData,
} from "@/repository/Book/BookBackupRepository";
import { BookRepository } from "@/repository/Book/BookRepository";

/** Save a book to the server */
export const saveBookToServer = async (bookUuid: string, token: string) => {
  try {
    const backupData = await collectBookBackupData(bookUuid);
    const { localUpdatedAt, serverUpdatedAt, syncState, ...restBook } = backupData.book;
    const sanitizedBackup = { ...backupData, book: restBook };

    const response = await inkLuminAPI.saveBookData(token, {
      uuid: bookUuid,
      bookTitle: backupData.book.title,
      kind: backupData.book.kind,
      form: backupData.book.form,
      genre: backupData.book.genre,
      cover: backupData.book.cover,
      description: backupData.book.description,
      bookData: JSON.stringify(sanitizedBackup),
    });

    if (response.success) {
      notifications.show({ message: "Произведение успешно сохранено на сервер", color: "green" });
      if (response.data?.updatedAt) {
        await BookRepository.update(configDatabase, bookUuid, {
          serverUpdatedAt: response.data.updatedAt,
          localUpdatedAt: response.data.updatedAt,
          syncState: "synced",
        });
      } else {
        await BookRepository.update(configDatabase, bookUuid, { syncState: "synced" });
      }
      return true;
    } else {
      throw new Error(response.message || "Ошибка сохранения на сервер");
    }
  } catch (error: any) {
    notifications.show({
      message: `Ошибка сохранения на сервер: ${error.message || ""}`,
      color: "red",
    });
    return false;
  }
};

/** Load a book from the server */
export const loadBookFromServer = async (bookUuid: string, token: string) => {
  try {
    const response = await inkLuminAPI.getBookData(token, bookUuid);
    if (!response.success) {
      throw new Error(response.message || "Ошибка загрузки с сервера");
    }

    const backupData: BackupData = JSON.parse(response.data.bookData);
    if (response.data?.updatedAt) {
      backupData.book.serverUpdatedAt = response.data.updatedAt;
      backupData.book.localUpdatedAt = response.data.updatedAt;
      backupData.book.syncState = "synced";
    }

    await importBookData(backupData);
    notifications.show({ message: "Произведение успешно загружена с сервера", color: "green" });
    return true;
  } catch (error: any) {
    notifications.show({
      message: `Ошибка загрузки с сервера: ${error.message || ""}`,
      color: "red",
    });
    return false;
  }
};

/** Fetch list of books stored on the server */
export const getServerBooksList = async (token: string) => {
  try {
    const response = await inkLuminAPI.getBooksList(token);
    if (response.success) {
      const serverBooks = response.data || [];
      const localBooks = await BookRepository.getAll(configDatabase);

      for (const srvBook of serverBooks) {
        const localBook = localBooks.find((b) => b.uuid === srvBook.uuid);
        if (!localBook) continue;

        const serverDate = moment(srvBook.updatedAt);
        const localDate = localBook.localUpdatedAt ? moment(localBook.localUpdatedAt) : moment(0);
        const updates: any = { serverUpdatedAt: srvBook.updatedAt };

        if (serverDate > localDate) {
          updates.syncState = "serverChanges";
        } else if (localBook.syncState !== "localChanges") {
          updates.syncState = "synced";
        }

        await BookRepository.update(configDatabase, localBook.uuid, updates);
      }

      return serverBooks;
    }
    throw new Error(response.message || "Ошибка получения списка произведений");
  } catch (error: any) {
    notifications.show({
      message: `Ошибка получения списка произведений с сервера: ${error.message || ""}`,
      color: "red",
    });
    return [];
  }
};

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/** Background synchronization hook */
export const useServerSync = (token: string | undefined) => {
  useEffect(() => {
    if (!token) return;

    const syncBooks = async () => {
      try {
        const serverResponse = await inkLuminAPI.getBooksList(token);
        if (!serverResponse || !serverResponse.data) {
          return;
        }

        const serverBooks: IBook[] = serverResponse.data.map((book: any) => ({
          uuid: book.uuid,
          title: book.title,
          author: book.author,
          form: book.form,
          genre: book.genre,
          configurationUuid: book.configurationUuid,
          configurationTitle: book.configurationTitle,
          cover: book.cover,
          kind: book.kind,
          description: book.description,
          serverUpdatedAt: book.updatedAt,
        }));

        const localBooks = await BookRepository.getAll(configDatabase);

        for (const serverBook of serverBooks) {
          if (!serverBook.uuid || !serverBook.serverUpdatedAt) continue;
          const localBook = localBooks.find((b) => b.uuid === serverBook.uuid);
          if (localBook && localBook.uuid) {
            const serverDate = moment(serverBook.serverUpdatedAt);
            const localDate = localBook.localUpdatedAt
              ? moment(localBook.localUpdatedAt)
              : moment(0);
            if (serverDate.unix() > localDate.unix()) {
              await BookRepository.update(configDatabase, localBook.uuid, {
                serverUpdatedAt: serverBook.serverUpdatedAt,
                syncState: "serverChanges",
              });
            } else if (localBook.syncState !== "localChanges") {
              if (localBook.syncState !== "synced") {
                await BookRepository.update(configDatabase, localBook.uuid, {
                  syncState: "synced",
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during server sync:", error);
      }
    };

    syncBooks();
    const intervalId = setInterval(syncBooks, SYNC_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token]);
};
