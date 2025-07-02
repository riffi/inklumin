import { useEffect, useState } from "react";
import { IconCloud, IconCloudDown, IconDownload, IconUpload } from "@tabler/icons-react";
import { Box, Button, Divider, Group, LoadingOverlay, Select, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { configDatabase } from "@/entities/configuratorDb";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { BookRepository } from "@/repository/Book/BookRepository";
import {
  getServerBooksList,
  loadBookFromServer,
  saveBookToServer,
} from "@/services/bookSyncService";
import { exportBook, handleFileImport } from "@/utils/bookBackupUtils/bookBackupManager";

export const BookBackupTab = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedServerBook, setSelectedServerBook] = useState<string | null>(null);
  const [localBooks, setLocalBooks] = useState<{ value: string; label: string }[]>([]);
  const [serverBooks, setServerBooks] = useState<{ value: string; label: string }[]>([]);
  const { user } = useAuth();
  const token = user?.token;

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

  // Загрузка списка произведений с сервера
  const loadServerBooks = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const books = await getServerBooksList(token);
      setServerBooks(
        books.map((book: any) => ({
          value: book.uuid,
          label: book.bookTitle,
        }))
      );
    } catch (error) {
      notifications.show({
        message: "Ошибка загрузки списка произведений с сервера",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalBooks();
    if (token) {
      loadServerBooks();
    }
  }, [token]);

  const handleExport = async () => {
    if (!selectedBook) {
      notifications.show({ message: "Выберите произведение", color: "red" });
      return;
    }
    setLoading(true);
    await exportBook(selectedBook);
    setLoading(false);
  };

  const handleSaveToServer = async () => {
    if (!selectedBook) {
      notifications.show({ message: "Выберите произведение", color: "red" });
      return;
    }
    if (!token) {
      notifications.show({ message: "Токен авторизации не найден", color: "red" });
      return;
    }

    setLoading(true);
    const success = await saveBookToServer(selectedBook, token);
    if (success) {
      await loadServerBooks(); // Обновляем список произведений на сервере
    }
    setLoading(false);
  };

  const handleLoadFromServer = async () => {
    if (!selectedServerBook) {
      notifications.show({ message: "Выберите произведение с сервера", color: "red" });
      return;
    }
    if (!token) {
      notifications.show({ message: "Токен авторизации не найден", color: "red" });
      return;
    }

    setLoading(true);
    const success = await loadBookFromServer(selectedServerBook, token);
    if (success) {
      await loadLocalBooks(); // Обновляем список локальных произведений
    }
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
        Экспорт и импорт полных данных произведения. При импорте существующие данные произведения будут полностью
        заменены.
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

        <Divider />

        {/* Серверные операции */}
        <Box>
          <Text size="md" fw={500} mb="md">
            Серверные операции
          </Text>

          {!token ? (
            <Text size="sm" c="dimmed">
              Для работы с сервером необходимо войти в систему
            </Text>
          ) : (
            <Stack spacing="md">
              {/* Сохранение на сервер */}
              <Box>
                <Text size="sm" mb="sm">
                  Сохранить локальное произведение на сервер:
                </Text>
                <Group>
                  <Button
                    leftSection={<IconCloud size={20} />}
                    onClick={handleSaveToServer}
                    variant="filled"
                    color="blue"
                    disabled={!selectedBook}
                  >
                    Сохранить на сервер
                  </Button>
                </Group>
              </Box>

              {/* Загрузка с сервера */}
              <Box>
                <Text size="sm" mb="sm">
                  Загрузить произведение с сервера:
                </Text>
                <Select
                  label="Выберите произведение на сервере"
                  data={serverBooks}
                  value={selectedServerBook}
                  onChange={setSelectedServerBook}
                  mb="sm"
                  placeholder="Выберите произведение на сервере..."
                />
                <Group>
                  <Button
                    leftSection={<IconCloudDown size={20} />}
                    onClick={handleLoadFromServer}
                    variant="filled"
                    color="green"
                    disabled={!selectedServerBook}
                  >
                    Загрузить с сервера
                  </Button>
                  <Button variant="subtle" onClick={loadServerBooks} size="sm">
                    Обновить список
                  </Button>
                </Group>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </div>
  );
};
