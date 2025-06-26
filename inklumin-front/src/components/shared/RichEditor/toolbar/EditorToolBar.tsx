import React from "react";
import { IconAlignJustified, IconBlockquote, IconH1, IconPalette } from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

interface IEditorToolBarProps {
  editor: any;
  children?: React.ReactNode;
  mobileTop: number;
  desktopTop: number;
  focusMode: boolean;
  toggleFocusMode: () => void;
}
export const EditorToolBar = (props: IEditorToolBarProps) => {
  const { isMobile } = useMedia();

  if (props.focusMode) {
    return null;
  }

  return (
    <>
      <RichTextEditor.Toolbar
        style={
          isMobile
            ? {
                top: props.mobileTop,
              }
            : {
                top: props.desktopTop,
              }
        }
      >
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.ClearFormatting />

          {!isMobile && (
            <>
              <RichTextEditor.Strikethrough />
            </>
          )}
        </RichTextEditor.ControlsGroup>
        <div className={"mantine-RichTextEditor-divider"} />

        {props.children}

        {!isMobile && <div className={"mantine-RichTextEditor-divider"} />}

        {!isMobile && (
          <>
            <Menu withinPortal={false}>
              <Menu.Target>
                <RichTextEditor.Control>
                  <IconH1 size={16} />
                </RichTextEditor.Control>
              </Menu.Target>
              <Menu.Dropdown>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>
              </Menu.Dropdown>
            </Menu>

            <Menu withinPortal={false}>
              <Menu.Target>
                <RichTextEditor.Control>
                  <IconBlockquote size={16} />
                </RichTextEditor.Control>
              </Menu.Target>
              <Menu.Dropdown>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.Subscript />
                  <RichTextEditor.Superscript />
                </RichTextEditor.ControlsGroup>
              </Menu.Dropdown>
            </Menu>

            <Menu withinPortal={false}>
              <Menu.Target>
                <RichTextEditor.Control>
                  <IconAlignJustified size={16} />
                </RichTextEditor.Control>
              </Menu.Target>
              <Menu.Dropdown>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignJustify />
                  <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>
              </Menu.Dropdown>
            </Menu>

            <Menu withinPortal={false}>
              <Menu.Target>
                <RichTextEditor.Control>
                  <IconPalette size={16} />
                </RichTextEditor.Control>
              </Menu.Target>
              <Menu.Dropdown>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.ColorPicker
                    colors={[
                      "#25262b",
                      "#868e96",
                      "#fa5252",
                      "#e64980",
                      "#be4bdb",
                      "#7950f2",
                      "#4c6ef5",
                      "#228be6",
                      "#15aabf",
                      "#12b886",
                      "#40c057",
                      "#82c91e",
                      "#fab005",
                      "#fd7e14",
                    ]}
                  />
                  <RichTextEditor.Color color="#F03E3E" />
                  <RichTextEditor.Color color="#7048E8" />
                  <RichTextEditor.Color color="#1098AD" />
                  <RichTextEditor.Color color="#37B24D" />
                  <RichTextEditor.Color color="#F59F00" />
                </RichTextEditor.ControlsGroup>
              </Menu.Dropdown>
            </Menu>
          </>
        )}
        <div className={"mantine-RichTextEditor-divider"} />
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
    </>
  );
};
