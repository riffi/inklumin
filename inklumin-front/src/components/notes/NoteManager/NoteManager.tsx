import { useEffect, useState } from "react";
import {
  IconCheck,
  IconCloud,
  IconCloudDown,
  IconDownload,
  IconEdit,
  IconFolder,
  IconList,
  IconNote,
  IconPlus,
  IconQuestionMark,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Tabs,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNoteManager } from "@/components/notes/hook/useNoteManager";
import { FolderList } from "@/components/notes/parts/FolderList";
import { NoteFolderSelector } from "@/components/notes/parts/NoteFolderSelector";
import { NoteList } from "@/components/notes/parts/NoteList";
import { INote, INoteGroup } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { NoteGroupRepository } from "@/repository/Note/NoteGroupRepository";
import { NoteMetaRepository } from "@/repository/Note/NoteMetaRepository";
import { loadNotesFromServer, saveNotesToServer } from "@/services/noteSyncService";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export interface NoteManagerProps {
  bookNotesMode?: boolean;
}

const getSyncStateText = (syncState: "localChanges" | "serverChanges" | "synced" | undefined) => {
  switch (syncState) {
    case "localChanges":
      return "Локальные изменения";
    case "serverChanges":
      return "Серверные изменения";
    case "synced":
      return "Синхронизировано";
    default:
      return "Статус неизвестен";
  }
};

const getSyncStateColor = (syncState: "localChanges" | "serverChanges" | "synced" | undefined) => {
  switch (syncState) {
    case "localChanges":
      return "orange";
    case "serverChanges":
      return "blue";
    case "synced":
      return "green";
    default:
      return "gray";
  }
};

export const NoteManager = ({ bookNotesMode = false }: NoteManagerProps) => {
  const { selectedBook } = useBookStore();
  const { noteManagerMode: globalNoteManagerMode, setNoteManagerMode: setGlobalNoteManagerMode } =
    useUiSettingsStore();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<INoteGroup>>({});
  const [currentNote, setCurrentNote] = useState<Partial<INote>>({});
  const { isMobile } = useMedia();
  const { user } = useAuth();
  const token = user?.token;

  const {
    getTopLevelGroups,
    getAllNotes,
    createNoteGroup,
    updateNoteGroup,
    deleteNoteGroup,
    createNote,
    deleteNote,
  } = useNoteManager();

  const groups = useLiveQuery(getTopLevelGroups) || [];
  const notesMeta = useLiveQuery(() => NoteMetaRepository.getMeta(), []);
  const allNotes =
    useLiveQuery(() => {
      if (bookNotesMode && selectedBook) {
        return getAllNotes(selectedBook.uuid);
      }
      return getAllNotes();
    }, [bookNotesMode, selectedBook, getAllNotes]) || [];

  const navigate = useNavigate();
  const { setHeader } = useMobileHeader();

  useEffect(() => {
    setHeader({
      title: "Заметки",
      actions: [
        {
          title: "Справка",
          icon: <IconQuestionMark size="1rem" />,
          handler: () => navigate("/knowledge-base/b1fa9a49-88aa-4d5e-932d-f9234f6a0a4c"),
        },
      ],
    });
    return () => setHeader(null);
  }, []);

  const handleGroupSubmit = async () => {
    if (currentGroup.title) {
      await (currentGroup.uuid ? updateNoteGroup : createNoteGroup)(currentGroup as INoteGroup);
      setGroupModalOpen(false);
    }
  };

  const handleNoteSubmit = async () => {
    if (bookNotesMode && selectedBook) {
      if (!currentNote.title) {
        notifications.show({
          message: "Введите название заметки",
          color: "orange",
        });
        return;
      }

      let targetFolder = await NoteGroupRepository.getByTitle(configDatabase, selectedBook.title);

      if (!targetFolder) {
        // createNoteGroup now returns the created group object
        targetFolder = await createNoteGroup({
          title: selectedBook.title,
          parentUuid: "topLevel",
        } as Omit<INoteGroup, "uuid">); // Removed 'id' as it's not part of INoteGroup input for creation
      }

      if (targetFolder && targetFolder.uuid) {
        // Ensure targetFolder and its uuid exist
        await createNote({
          ...currentNote,
          noteGroupUuid: targetFolder.uuid,
          bookUuid: selectedBook.uuid, // Ensure bookUuid is set
        } as Omit<INote, "id" | "uuid">);
        setNoteModalOpen(false);
        setCurrentNote({});
      } else {
        notifications.show({
          message: "Не удалось найти или создать папку для заметок произведения.",
          color: "red",
        });
      }
    } else {
      // Original logic
      if (!currentNote.noteGroupUuid) {
        notifications.show({
          message: "Выберите папку",
          color: "orange",
        });
        return; // Added return
      }
      if (!currentNote.title) {
        notifications.show({
          message: "Введите название заметки",
          color: "orange",
        });
        return; // Added return
      }
      if (currentNote.title && currentNote.noteGroupUuid) {
        await createNote(currentNote as Omit<INote, "id" | "uuid">);
        setNoteModalOpen(false);
        setCurrentNote({});
      }
    }
  };

  const handleSaveToServer = async () => {
    if (!token) {
      notifications.show({ message: "Для сохранения на сервер необходимо войти", color: "red" });
      return;
    }
    await saveNotesToServer(token);
  };

  const handleLoadFromServer = async () => {
    if (!token) {
      notifications.show({ message: "Для загрузки с сервера необходимо войти", color: "red" });
      return;
    }
    await loadNotesFromServer(token);
  };

  // Determine effective mode, forcing 'list' if bookNotesMode is true
  const effectiveNoteManagerMode = bookNotesMode ? "list" : globalNoteManagerMode;

  // Adjust setNoteManagerMode to prevent changing from 'list' in bookNotesMode
  const setEffectiveNoteManagerMode = (mode: "folders" | "list") => {
    if (!bookNotesMode) {
      setGlobalNoteManagerMode(mode);
    }
  };

  const handleOpenAddModal = () => {
    if (bookNotesMode && selectedBook) {
      setCurrentNote({ bookUuid: selectedBook.uuid });
      setNoteModalOpen(true);
    } else if (effectiveNoteManagerMode === "folders") {
      setCurrentGroup({}); // Reset current group before opening
      setGroupModalOpen(true);
    } else {
      setCurrentNote({}); // Reset current note
      setNoteModalOpen(true);
    }
  };

  return (
    <Container
      style={{ background: "#fff", paddingBottom: "2rem", paddingTop: "2rem", minHeight: "60vh" }}
    >
      <Group justify="space-between" mb="md">
        {!bookNotesMode && (
          <Tabs
            value={effectiveNoteManagerMode}
            onChange={(v) => setEffectiveNoteManagerMode(v as "folders" | "list")}
          >
            <Tabs.List>
              <Tabs.Tab value="folders" leftSection={<IconFolder size={16} />}>
                Папки
              </Tabs.Tab>
              <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                Список
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        )}
        {bookNotesMode && (
          <Box>
            <Text size={"xl"}>Заметки: {selectedBook.title}</Text>
          </Box>
        )}

        {notesMeta && (
          <Group gap="xs" align="center" wrap="nowrap">
            {notesMeta.syncState === "synced" && <IconCheck size={14} color="green" />}
            {notesMeta.syncState === "localChanges" && <IconUpload size={14} color="orange" />}
            {notesMeta.syncState === "serverChanges" && <IconCloudDown size={14} color="blue" />}
            <Text size="xs" c={getSyncStateColor(notesMeta.syncState)}>
              {getSyncStateText(notesMeta.syncState)}
            </Text>
            {notesMeta.syncState === "localChanges" && (
              <ActionIcon
                size="sm"
                variant="light"
                color="orange"
                onClick={handleSaveToServer}
                title="Отправить на сервер"
              >
                <IconCloud size={16} />
              </ActionIcon>
            )}
            {notesMeta.syncState === "serverChanges" && (
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={handleLoadFromServer}
                title="Загрузить с сервера"
              >
                <IconDownload size={16} />
              </ActionIcon>
            )}
          </Group>
        )}

        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAddModal}>
          {bookNotesMode ? "заметка" : effectiveNoteManagerMode === "folders" ? "папка" : "заметка"}
        </Button>
      </Group>

      {effectiveNoteManagerMode === "folders" && !bookNotesMode ? (
        <FolderList
          groups={groups}
          onDelete={deleteNoteGroup}
          onEdit={(group) => {
            setCurrentGroup(group);
            setGroupModalOpen(true);
          }}
          onNavigate={(uuid) => navigate(`/notes/folder/${uuid}`)}
          onAdd={() => setGroupModalOpen(true)}
          onMove={(group, newParentUuid) => {
            updateNoteGroup({
              ...group,
              parentUuid: newParentUuid,
            } as INoteGroup);
          }}
        />
      ) : (
        <>
          <NoteList
            notes={allNotes}
            onDelete={deleteNote}
            onEdit={(note) => navigate(`/notes/edit/${note.uuid}`)}
            onAdd={() => setNoteModalOpen(true)}
            showFolderName
          />
        </>
      )}

      {/* Модалка папки */}
      <Modal
        opened={groupModalOpen}
        fullScreen={isMobile}
        onClose={() => setGroupModalOpen(false)}
        title={currentGroup.uuid ? "Редактировать папку" : "Новая папка"}
      >
        <TextInput
          label="Название"
          placeholder="Название папки"
          value={currentGroup.title || ""}
          onChange={(e) => setCurrentGroup({ ...currentGroup, title: e.target.value })}
          mb="md"
        />
        <Button fullWidth onClick={handleGroupSubmit}>
          Сохранить
        </Button>
      </Modal>

      {/* Модалка заметки */}
      <Modal
        opened={noteModalOpen}
        fullScreen={isMobile}
        onClose={() => setNoteModalOpen(false)}
        title="Новая заметка"
      >
        <TextInput
          label="Название"
          value={currentNote.title || ""}
          placeholder="Название заметки"
          onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
          mb="md"
        />
        {!bookNotesMode && (
          <>
            <Text
              style={{
                fontWeight: "500",
                fontSize: "0.8rem",
              }}
            >
              Папка
            </Text>
            <NoteFolderSelector
              selectedUuid={currentNote?.noteGroupUuid}
              onSelect={(value) => setCurrentNote({ ...currentNote, noteGroupUuid: value })}
            />
          </>
        )}
        <TagsInput
          label="Теги"
          placeholder="Введите теги через запятую"
          value={currentNote.tags?.split(",") || []}
          onChange={(tags) =>
            setCurrentNote({ ...currentNote, tags: tags.join(",").toLowerCase() })
          }
        />
        <Button fullWidth mt="md" onClick={handleNoteSubmit}>
          Создать
        </Button>
      </Modal>
    </Container>
  );
};
