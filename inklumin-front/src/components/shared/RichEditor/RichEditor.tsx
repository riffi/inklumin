// SceneRichTextEditor.tsx
import { RichTextEditor } from "@mantine/tiptap";

import "@mantine/tiptap/styles.css";

import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

import "./editor.override.css";

import React, { useState } from "react";
import { IconCheck, IconFocus } from "@tabler/icons-react";
import { Button, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LoadingOverlayExtended } from "@/components/shared/overlay/LoadingOverlayExtended";
import { useEditorState } from "@/components/shared/RichEditor/hooks/useEditorState";
import { useWarningGroups } from "@/components/shared/RichEditor/hooks/useWarningGroups";
import { ChecksDrawerButton } from "@/components/shared/RichEditor/toolbar/ChecksDrawerButton";
import { EditorToolBar } from "@/components/shared/RichEditor/toolbar/EditorToolBar";
import { SuggestionsDrawerButton } from "@/components/shared/RichEditor/toolbar/SuggestionsDrawerButton";
import { IWarningGroup } from "@/components/shared/RichEditor/types";

export interface IRichEditorConstraints {
  top: number;
  bottom: number;
}
export interface ISceneRichTextEditorProps {
  initialContent?: string;
  onContentChange?: (contentHtml: string, contentText: string) => void;
  onWarningsChange?: (warningGroups: IWarningGroup[]) => void;
  selectedGroup?: IWarningGroup;
  onScroll?: (scrollTop: number) => void;
  mobileConstraints?: IRichEditorConstraints;
  desktopConstraints?: IRichEditorConstraints;
  setSelectedGroup?: (group: IWarningGroup | undefined) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
}

const TOOLBAR_HEIGHT = 40;
export const RichEditor = (props: ISceneRichTextEditorProps) => {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: "",
  });

  const mobileConstraints = props.mobileConstraints || { top: 50, bottom: 100 };
  const desktopConstraints = props.desktopConstraints || { top: 0, bottom: 0 };

  const [scrollTop, setScrollTop] = useState(0);

  const [isDrawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionType, setSuggestionType] = useState<
    "synonyms" | "paraphrase" | "simplify" | "rhymes"
  >("synonyms");
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number }>({
    from: 0,
    to: 0,
  });
  const [repeatsActive, setRepeatsActive] = useState(false);
  const [clichesActive, setClichesActive] = useState(false);
  const [spellingActive, setSpellingActive] = useState(false);
  const { isMobile } = useMedia();

  const onSelectionChange = (from: number, to: number) => {
    setSelectedText(editor?.state.doc.textBetween(from, to, " "));
    setSelectionRange({ from, to });
  };

  const { editor } = useEditorState(
    props.initialContent || "",
    props.focusMode, // Pass focusMode here
    props.onContentChange,
    onSelectionChange
  );
  const warningGroups = useWarningGroups(
    editor,
    props.selectedGroup,
    props.onWarningsChange,
    props.setSelectedGroup
  );

  // Обработчик прокрутки
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    props.onScroll?.(event.target.scrollTop);
    setScrollTop(event.target.scrollTop);
  };

  return (
    <>
      <LoadingOverlayExtended visible={loadingState.isLoading} message={loadingState.message} />
      <RichTextEditor
        editor={editor}
        variant={props.focusMode ? "unstyled" : "subtle"}
        className={props.focusMode ? "focus-mode-paragraphs" : ""}
        style={
          isMobile
            ? {
                position: "fixed",
                zIndex: 95,
                top: mobileConstraints.top + (props.focusMode ? 0 : TOOLBAR_HEIGHT),
                bottom: mobileConstraints.bottom,
                overflow: "scroll",
                left: 0,
                backgroundColor: "white",
                width: "100%",
                border: "none",
              }
            : {}
        }
        onScroll={handleScroll}
      >
        <EditorToolBar
          editor={editor}
          mobileTop={mobileConstraints?.top}
          desktopTop={desktopConstraints?.top}
          focusMode={props.focusMode}
          toggleFocusMode={props.toggleFocusMode}
        >
          <RichTextEditor.ControlsGroup>
              <ChecksDrawerButton
            editor={editor}
            onLoadingChange={(isLoading, message) =>
              setLoadingState({
                isLoading,
                message: message || "",
              })
            }
            repeatsActive={repeatsActive}
            setRepeatsActive={setRepeatsActive}
            clichesActive={clichesActive}
            setClichesActive={setClichesActive}
            spellingActive={spellingActive}
            setSpellingActive={setSpellingActive}
          />
          <SuggestionsDrawerButton
            editor={editor}
            selectedText={selectedText}
            onLoadingChange={(isLoading, message) =>
              setLoadingState({ isLoading, message: message || "" })
            }
            onSuggestionsFound={(items, type) => {
              if (!items || items.length === 0) return;
              setSuggestions(items);
              setSuggestionType(type as any);
              openDrawer();
            }}
          />
          <RichTextEditor.Control onClick={props.toggleFocusMode} aria-label="Focus mode">
            <IconFocus />
          </RichTextEditor.Control>
          </RichTextEditor.ControlsGroup>
        </EditorToolBar>
        <RichTextEditor.Content />
      </RichTextEditor>
      <Drawer
        opened={isDrawerOpened}
        onClose={closeDrawer}
        title={
          suggestionType === "synonyms"
            ? "Найденные синонимы"
            : suggestionType === "paraphrase"
              ? "Варианты перефразирования"
              : suggestionType === "rhymes" // Добавляем условие для рифм
                ? "Найденные рифмы"
                : "Упрощенные варианты"
        }
        position="right"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {selectedText && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff3e0",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, color: "gray", marginBottom: 4 }}>
                Оригинальный текст:
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}>
                {" "}
                {selectedText}{" "}
              </div>{" "}
            </div>
          )}
          {suggestions?.map((suggestion) => (
            <div
              key={suggestion}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  flexGrow: 1,
                  fontFamily: "inherit",
                }}
              >
                {suggestion}
              </pre>
              <Button
                variant="subtle"
                size="xs"
                p={4}
                style={{
                  width: 120, // Фиксированная ширина
                  height: 32, // Фиксированная высота
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                onClick={() => {
                  if (editor) {
                    editor.setEditable(true);
                    // вычисляем число пробелов в конце выбранного текста
                    const trailingSpaces = selectedText.length - selectedText.trimEnd().length;
                    // исключаем пробелы из диапазона замены
                    editor.commands.setTextSelection({
                      from: selectionRange.from,
                      to: selectionRange.to - trailingSpaces,
                    });
                    editor.chain().insertContent(suggestion).run();
                    editor.commands.focus(selectionRange.from + suggestion.length);
                    editor.commands.setTextSelection({
                      from: selectionRange.from,
                      to: selectionRange.from + suggestion.length,
                    });
                  }
                  closeDrawer();
                }}
              >
                <IconCheck size={18} />
              </Button>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
