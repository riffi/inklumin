import { useLiveQuery } from "dexie-react-hooks";
import { notifications } from "@mantine/notifications";
import { IBook } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { IBookConfiguration } from "@/entities/ConstructorEntities";
import { useDialog } from "@/providers/DialogProvider/DialogProvider";
import { BookRepository } from "@/repository/Book/BookRepository";
import { BookService } from "@/services/bookService";
import { useBookStore } from "@/stores/bookStore/bookStore";

export const useBookManager = () => {
  const { showDialog } = useDialog();
  const { clearSelectedBook } = useBookStore();

  // Получаем список произведений и конфигураций из базы данных
  const books = useLiveQuery<IBook[]>(() => BookRepository.getAll(configDatabase), []);
  const configurations = useLiveQuery<IBookConfiguration[]>(
    () => configDatabase.bookConfigurations.toArray(),
    []
  );

  const saveBook = async (book: IBook) => {
    const result = await BookService.saveBook(book);
    if (result.success) {
      notifications.show({
        title: "Произведение",
        message: `Произведение "${book.title}" сохранено`,
      });
    } else {
      notifications.show({
        title: "Ошибка",
        message: result.message || "Не удалось сохранить произведение",
        color: "red",
      });
    }
  };

  const deleteBook = async (book: IBook) => {
    const confirm = await showDialog(
      "Подтверждение",
      `Вы уверены, что хотите удалить произведение ${book.title}?`
    );
    if (confirm) {
      clearSelectedBook();
      const result = await BookService.deleteBook(book);
      if (result.success) {
        notifications.show({
          title: "Произведение",
          message: `Произведение "${book.title}" удалено`,
        });
      } else {
        notifications.show({
          title: "Ошибка",
          message: result.message || "Не удалось удалить произведение",
          color: "red",
        });
      }
    }
  };

  const refreshBooks = async () => {
    await BookRepository.getAll(configDatabase);
  };

  return {
    books,
    configurations,
    saveBook,
    deleteBook,
    refreshBooks,
  };
};
