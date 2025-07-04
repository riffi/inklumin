import { useEffect, useState } from "react";
import { IconEdit, IconFolder, IconNote, IconPlus, IconTrash } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ActionIcon,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Space,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useNoteManager } from "@/components/notes/hook/useNoteManager";
import { FolderList } from "@/components/notes/parts/FolderList";
import { NoteList } from "@/components/notes/parts/NoteList";
import { INote, INoteGroup } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { NoteGroupRepository } from "@/repository/Note/NoteGroupRepository";

export const NoteFolder = () => {
  const { folderUuid } = useParams();
  const navigate = useNavigate();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<INoteGroup>>({});
  const [currentNote, setCurrentNote] = useState<Partial<INote>>({});
  const [breadcrumbs, setBreadcrumbs] = useState<INoteGroup[]>([]);
  const { isMobile } = useMedia();
  const {
    getChildGroups,
    getNotesByGroup,
    createNoteGroup,
    updateNoteGroup,
    deleteNoteGroup,
    createNote,
    deleteNote,
  } = useNoteManager();

  const groups = useLiveQuery(() => getChildGroups(folderUuid || ""), [folderUuid]) || [];
  const notes = useLiveQuery(() => getNotesByGroup(folderUuid || ""), [folderUuid]) || [];
  const currentFolder = useLiveQuery(
    () => NoteGroupRepository.getByUuid(configDatabase, folderUuid || ""),
    [folderUuid]
  );

  // Сбор хлебных крошек при изменении текущей папки
  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      const crumbs: INoteGroup[] = [];
      let current = currentFolder;

      while (current && current.parentUuid !== "topLevel") {
        const parent = await NoteGroupRepository.getByUuid(configDatabase, current.parentUuid);

        if (parent) {
          crumbs.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }
      setBreadcrumbs(crumbs);
    };

    if (currentFolder) {
      fetchBreadcrumbs();
    }
  }, [currentFolder]); // Зависимость от currentFolder

  const handleGroupSubmit = async () => {
    if (currentGroup.title) {
      const groupData = {
        ...currentGroup,
        parentUuid: folderUuid,
      };
      await (currentGroup.uuid ? updateNoteGroup : createNoteGroup)(groupData as INoteGroup);
      setGroupModalOpen(false);
    }
  };

  const handleNoteSubmit = async () => {
    if (currentNote.title) {
      await createNote({
        ...currentNote,
        noteGroupUuid: folderUuid || "",
      } as Omit<INote, "id" | "uuid">);
      setNoteModalOpen(false);
    }
  };

  return (
    <Container style={{ background: "#fff", paddingBottom: "2rem", minHeight: "60vh" }}>
      <Breadcrumbs mb="md">
        <Button variant="subtle" onClick={() => navigate("/notes")}>
          Главная
        </Button>
        {breadcrumbs.map((folder) => (
          <Button
            key={folder.uuid}
            variant="subtle"
            onClick={() => navigate(`/notes/folder/${folder.uuid}`)}
          >
            {folder.title}
          </Button>
        ))}
        <Text>{currentFolder?.title}</Text>
      </Breadcrumbs>

      <Group justify="space-between" mb="md">
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setGroupModalOpen(true)}>
            подпапка
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setNoteModalOpen(true)}>
            заметка
          </Button>
        </Group>
      </Group>

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
        currentFolderUuid={folderUuid}
      />

      <Space h="md" />
      {notes?.length === 0 && <></>}
      {notes?.length > 0 && (
        <>
          <Text size="lg" mb="md">
            Заметки
          </Text>
          <NoteList
            notes={notes}
            onDelete={deleteNote}
            onEdit={(note) => navigate(`/notes/edit/${note.uuid}`)}
            onAdd={() => setNoteModalOpen(true)}
            selectedFolderUuid={folderUuid}
          />
        </>
      )}

      {/* Модалка папки */}
      <Modal
        opened={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={currentGroup.uuid ? "Редактировать папку" : "Новая папка"}
        fullScreen={isMobile}
      >
        <TextInput
          label="Название"
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
        onClose={() => setNoteModalOpen(false)}
        title="Новая заметка"
        fullScreen={isMobile}
      >
        <TextInput
          label="Название"
          value={currentNote.title || ""}
          onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
          mb="md"
        />
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
