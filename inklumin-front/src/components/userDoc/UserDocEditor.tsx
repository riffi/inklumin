import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { IUserDocPage } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { UserDocRepository } from "@/repository/UserDocRepository";
import { generateUUID } from "@/utils/UUIDUtils";

interface UserDocEditorProps {
  opened: boolean;
  onClose: () => void;
  pageUuid?: string;
  configurationUuid?: string;
  bookUuid?: string;
  onSave?: (page: IUserDocPage) => void;
}

export const UserDocEditor = ({
  opened,
  onClose,
  pageUuid,
  configurationUuid,
  bookUuid,
  onSave,
}: UserDocEditorProps) => {
  const db = useDb(bookUuid);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!opened) return;
    const load = async () => {
      if (pageUuid) {
        const page = await UserDocRepository.getByUuid(db, pageUuid);
        if (page) {
          setTitle(page.title);
          setMarkdown(page.markdown);
          return;
        }
      }
      setTitle("");
      setMarkdown("");
    };
    load();
  }, [opened, pageUuid, db]);

  const handleSave = async () => {
    const data: IUserDocPage = {
      uuid: pageUuid || generateUUID(),
      title,
      markdown,
      configurationUuid: bookUuid ? undefined : configurationUuid,
      bookUuid,
    };
    await UserDocRepository.save(db, data);
    onSave?.(data);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Страница базы знаний"
      size="xl"
      fullScreen={false}
    >
      <Stack gap="md">
        <TextInput
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <MDEditor value={markdown} onChange={(v) => setMarkdown(v || "")} height={400} />
        <Button onClick={handleSave}>Сохранить</Button>
      </Stack>
    </Modal>
  );
};
