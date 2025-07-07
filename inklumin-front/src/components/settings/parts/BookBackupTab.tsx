import { useEffect, useState } from "react";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { Box, Button, Group, LoadingOverlay, Select, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { configDatabase } from "@/entities/configuratorDb";
import { BookRepository } from "@/repository/Book/BookRepository";
import { exportBook, handleFileImport } from "@/utils/bookBackupUtils/bookBackupManager";

export const BookBackupTab = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [localBooks, setLocalBooks] = useState<{ value: string; label: string }[]>([]);

  // Загрузка локальных произведений
  const loadLocalBooks = async () => {
    try {
      const books = await BookRepository.getAll(configDatabase);
      setLocalBooks(books.map((book) => ({ value: book.uuid, label: book.title })));
    } catch (error) {
      notifications.show({
        message: "Ошибка загрузки локальных произведений",
        color: "red",
      });
    }
  };

  useEffect(() => {
    loadLocalBooks();
  }, []);

  const handleExport = async () => {
    if (!selectedBook) {
      notifications.show({ message: "Выберите произведение", color: "red" });
      return;
    }
    setLoading(true);
    await exportBook(selectedBook);
    setLoading(false);
  };

  const handleFileImportWithRefresh = async () => {
    setLoading(true);
    const success = await handleFileImport();
    if (success) {
      await loadLocalBooks(); // Обновляем список локальных произведений
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayBlur={2} />

      <Text size="sm" mb="xl">
        Экспорт и импорт полных данных произведения. При импорте существующие данные произведения
        будут полностью заменены.
      </Text>

      <Stack spacing="xl">
        {/* Локальные операции */}
        <Box>
          <Text size="md" fw={500} mb="md">
            Локальные операции
          </Text>

          <Select
            label="Выберите произведение для экспорта"
            data={localBooks}
            value={selectedBook}
            onChange={setSelectedBook}
            mb="md"
            placeholder="Выберите произведение..."
          />

          <Group>
            <Button
              leftSection={<IconDownload size={20} />}
              onClick={handleExport}
              variant="filled"
              disabled={!selectedBook}
            >
              Экспортировать в файл
            </Button>

            <Button
              leftSection={<IconUpload size={20} />}
              onClick={handleFileImportWithRefresh}
              variant="outline"
              color="red"
            >
              Импортировать из файла
            </Button>
          </Group>
        </Box>
      </Stack>
    </div>
  );
};
