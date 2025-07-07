import { useLiveQuery } from "dexie-react-hooks";
import { Heading } from "tabler-icons-react";
import { Box, Container, Paper, Switch, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { BookSettingsForm } from "@/components/books/BookSettingsForm/BookSettingsForm";
import { bookDb } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";
import { IBookConfiguration } from "@/entities/ConstructorEntities";
import { BookRepository } from "@/repository/Book/BookRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";

export const BookSettingsPage = () => {
  const { selectedBook, selectBook } = useBookStore();
  const configurations =
    useLiveQuery<IBookConfiguration[]>(() => configDatabase.bookConfigurations.toArray(), []) || [];

  const chapterOnlyMode = selectedBook?.chapterOnlyMode === 1;

  const handleToggleChapterOnlyMode = async (value: boolean) => {
    if (!selectedBook) return;
    await BookRepository.update(configDatabase, selectedBook.uuid, {
      chapterOnlyMode: value ? 1 : 0,
    });
    await updateBookLocalUpdatedAt(bookDb);
    selectBook({ ...selectedBook, chapterOnlyMode: value ? 1 : 0 });
  };

  if (!selectedBook) {
    return null;
  }

  const handleSave = async (data: any) => {
    await BookRepository.update(configDatabase, selectedBook.uuid, data);
    await updateBookLocalUpdatedAt(bookDb);
    notifications.show({
      title: "Данные произведения обновлены",
    });
    selectBook({ ...selectedBook, ...data });
  };

  const kind = selectedBook?.kind

  return (
    <Container size={900} my="md">
      <Paper>
        <Box p="md">
          <Title order={2} mb={"md"}>
            Настройки {kind === 'book' ? 'произведения' : 'материала'}
          </Title>
          {kind === 'book' && <Switch
            label="Не показывать сцены"
            checked={chapterOnlyMode}
            onChange={(e) => handleToggleChapterOnlyMode(e.currentTarget.checked)}
            mb="md"
          />}
          <BookSettingsForm
            configurations={configurations}
            initialData={selectedBook}
            onSave={handleSave}
          />
        </Box>
      </Paper>
    </Container>
  );
};
