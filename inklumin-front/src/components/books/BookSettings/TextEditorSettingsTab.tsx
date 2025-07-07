import { Switch } from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";
import { BookRepository } from "@/repository/Book/BookRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";

export const TextEditorSettingsTab = () => {
  const { selectedBook, selectBook } = useBookStore();

  if (!selectedBook) return null;

  const checked = selectedBook.useSimplePunctuationChecker === 1;

  const handleToggle = async (value: boolean) => {
    await BookRepository.update(configDatabase, selectedBook.uuid, {
      useSimplePunctuationChecker: value ? 1 : 0,
    });
    await updateBookLocalUpdatedAt(bookDb);
    selectBook({ ...selectedBook, useSimplePunctuationChecker: value ? 1 : 0 });
  };

  return (
    <Switch
      label="Базовая проверка орфографии"
      checked={checked}
      onChange={(e) => handleToggle(e.currentTarget.checked)}
    />
  );
};
