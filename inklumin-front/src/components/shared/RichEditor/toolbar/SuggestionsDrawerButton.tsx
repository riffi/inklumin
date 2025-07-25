import { IconBulb } from "@tabler/icons-react";
import { Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { ParaphraseAction } from "./actions/ParaphraseAction";
import { RhymesAction } from "./actions/RhymesAction";
import { SimplifyAction } from "./actions/SimplifyAction";
import { SynonymsAction } from "./actions/SynonymsAction";

interface SuggestionsDrawerButtonProps {
  editor: any;
  selectedText: string;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onSuggestionsFound: (suggestions: string[], type: string) => void;
}

export const SuggestionsDrawerButton = ({
  editor,
  selectedText,
  onLoadingChange,
  onSuggestionsFound,
}: SuggestionsDrawerButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleFound = (items: string[], type: string) => {
    onSuggestionsFound(items, type);
    close();
  };

  return (
    <>
      <RichTextEditor.Control
        onClick={() => {
          editor.setEditable(false);
          editor.commands.blur();
          open();
        }}
        active={opened}
        aria-haspopup
        aria-expanded={opened}
        title="Инструменты"
      >
        <IconBulb color="gray" />
      </RichTextEditor.Control>
      <Drawer opened={opened} onClose={close} title="Инструменты" position="right">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SynonymsAction
            editor={editor}
            selectedText={selectedText}
            onLoadingChange={onLoadingChange}
            onFound={(s) => handleFound(s, "synonyms")}
          />
          <ParaphraseAction
            editor={editor}
            selectedText={selectedText}
            onLoadingChange={onLoadingChange}
            onFound={(s) => handleFound(s, "paraphrase")}
          />
          <SimplifyAction
            editor={editor}
            selectedText={selectedText}
            onLoadingChange={onLoadingChange}
            onFound={(s) => handleFound(s, "simplify")}
          />
          <RhymesAction
            editor={editor}
            selectedText={selectedText}
            onLoadingChange={onLoadingChange}
            onFound={(s) => handleFound(s, "rhymes")}
          />
        </div>
      </Drawer>
    </>
  );
};
