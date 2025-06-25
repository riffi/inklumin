import moment from "moment/moment";
import { BookDB } from "@/entities/bookDb";
import { IBook } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { BookRepository } from "@/repository/Book/BookRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";

export const updateBookSyncState = async (bookUuid: string, syncState: IBook["syncState"]) => {
  if (!bookUuid) return;

  try {
    const currentDate = moment().toISOString(true);
    await BookRepository.update(configDatabase, bookUuid, {
      localUpdatedAt: currentDate,
      syncState,
    });
  } catch (error) {
    console.error("Error updating book sync state:", error);
  }
};

export const updateBookLocalUpdatedAt = async (db: BookDB) => {
  const bookUuid = db.name.replace("book_db_", "");
  await updateBookSyncState(bookUuid, "localChanges");
};
