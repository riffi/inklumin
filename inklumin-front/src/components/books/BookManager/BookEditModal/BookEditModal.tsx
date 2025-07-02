// BookEditModal.tsx
import { Modal } from "@mantine/core";
import { BookSettingsForm } from "@/components/books/BookSettingsForm/BookSettingsForm";
import { IBook } from "@/entities/BookEntities";
import { IBookConfiguration } from "@/entities/ConstructorEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IBook) => void;
  initialData?: IBook;
  configurations: IBookConfiguration[];
  kind?: string;
}

const getTitle = (uuid: string, kind: string) => {
  if (kind === 'material'){
    if (uuid){
      return "Редактирование информации о материале"
    }
    return "Добавление нового материала"
  }
  if (kind === 'book'){
    if (uuid){
      return "Редактирование информации о произведении"
    }
    return "Добавление нового произведения"
  }
}

export const BookEditModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  configurations,
  kind,
}: BookEditModalProps) => {
  const { isMobile } = useMedia();

  const handleSave = (data: IBook) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal
      title={getTitle(initialData?.uuid, initialData?.kind)}
      opened={isOpen}
      onClose={onClose}
      size="md"
      fullScreen={isMobile}
    >
      <BookSettingsForm
        onSave={handleSave}
        onCancel={onClose}
        initialData={initialData}
        configurations={configurations}
        kind={kind}
      />
    </Modal>
  );
};
