import { IconChecks } from "@tabler/icons-react";
import { Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { CheckClichesAction } from "./actions/CheckClichesAction";
import { CheckRepeatsAction } from "./actions/CheckRepeatsAction";
import { CheckSpellingAction } from "./actions/CheckSpellingAction";

interface ChecksDrawerButtonProps {
  editor: any;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  repeatsActive: boolean;
  setRepeatsActive: (value: boolean) => void;
  clichesActive: boolean;
  setClichesActive: (value: boolean) => void;
  spellingActive: boolean;
  setSpellingActive: (value: boolean) => void;
}

export const ChecksDrawerButton = ({
  editor,
  onLoadingChange,
  repeatsActive,
  setRepeatsActive,
  clichesActive,
  setClichesActive,
  spellingActive,
  setSpellingActive,
}: ChecksDrawerButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <RichTextEditor.Control onClick={open} title="Проверки">
        <IconChecks color="gray" />
      </RichTextEditor.Control>
      <Drawer opened={opened} onClose={close} title="Проверки" position="right">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <CheckRepeatsAction
            editor={editor}
            onLoadingChange={onLoadingChange}
            isActive={repeatsActive}
            setIsActive={setRepeatsActive}
            onClose={close}
          />
          <CheckClichesAction
            editor={editor}
            onLoadingChange={onLoadingChange}
            isActive={clichesActive}
            setIsActive={setClichesActive}
            onClose={close}
          />
          <CheckSpellingAction
            editor={editor}
            onLoadingChange={onLoadingChange}
            isActive={spellingActive}
            setIsActive={setSpellingActive}
            onClose={close}
          />
        </div>
      </Drawer>
    </>
  );
};
