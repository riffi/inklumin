import { bookDb } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";

/**
 * Возвращает подходящую базу данных в зависимости от наличия UUID книги
 */
export const useDb = (bookUuid?: string) => {
  return bookUuid ? bookDb : configDatabase;
};
