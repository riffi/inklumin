// useEditorState.ts
import { useCallback, useEffect, useRef, useState } from "react";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "lodash";
import { ClicheHighlighterExtension } from "@/components/shared/RichEditor/plugins/ClisheHightligherExtension";
// 1. Импортируем новое расширение
import { FocusModeExtension } from "@/components/shared/RichEditor/plugins/FocusModeExtension";
import { RepeatHighlighterExtension } from "@/components/shared/RichEditor/plugins/RepeatHighlighterExtension";
import SimplePunctuationChecker from "@/components/shared/RichEditor/plugins/SimplePunctuationChecker";
import { SpellingHighlighterExtension } from "@/components/shared/RichEditor/plugins/SpellingHighlighterExtension";

// 2. Обновляем функцию getEditorExtensions
const getEditorExtensions = (focusMode: boolean, useSimplePunctuationChecker: boolean) => [
  StarterKit,
  Underline,
  Superscript,
  SubScript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Color,
  TextStyle,
  Image.configure({ inline: true, allowBase64: true }),
  ...(useSimplePunctuationChecker ? [SimplePunctuationChecker] : []),
  RepeatHighlighterExtension,
  ClicheHighlighterExtension,
  SpellingHighlighterExtension,
  // 3. Конфигурируем расширение с актуальным значением focusMode
  FocusModeExtension.configure({
    focusMode,
  }),
];

// Хук для управления состоянием редактора
export const useEditorState = (
  initialContent: string,
  focusMode: boolean,
  useSimplePunctuationChecker: boolean,
  onContentChange?: (contentHtml: string, contentText: string) => void,
  onSelectionChange?: (from: number, to: number) => void
) => {
  const onContentChangeRef = useRef(onContentChange);

  const debouncedContentChange = useCallback(
    debounce((html: string, text: string) => onContentChangeRef.current?.(html, text), 600),
    []
  );

  // 4. Переписываем использование хука useEditor
  const editor = useEditor(
    {
      extensions: getEditorExtensions(focusMode, useSimplePunctuationChecker),
      content: initialContent,
      autofocus: true,
      editorProps: {
        handleDOMEvents: {
          copy: (view, event) => {
            const { state } = view;
            const { from, to } = state.selection;
            const selectedText = state.doc.textBetween(from, to, "\n");
            if (event.clipboardData) {
              event.clipboardData.setData("text/plain", selectedText);
              event.preventDefault();
              return true;
            }
            return false;
          },
        },
      },
      onUpdate: ({ editor }) => {
        if (editor.getHTML() !== initialContent) {
          debouncedContentChange(editor.getHTML(), editor.getText());
        }
      },
      onBlur: ({ editor }) => {
        editor.setEditable(false);
        if (editor.getHTML() !== initialContent) {
          onContentChange?.(editor.getHTML(), editor.getText());
        }
      },
      onTransaction: ({ editor, transaction }) => {
        if (transaction.meta?.pointer) {
          console.log("click ontransaction");
          editor.setEditable(true);
          editor.commands.focus();
        }
      },
      onSelectionUpdate({ editor }) {
        if (onSelectionChange) {
          onSelectionChange(editor.state.selection.from, editor.state.selection.to);
        }
      },
    },
    [focusMode, useSimplePunctuationChecker]
  ); // <-- ВАЖНО: добавляем focusMode в зависимости

  useEffect(() => () => debouncedContentChange.cancel(), [debouncedContentChange]);

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
        debouncedContentChange.cancel();
        const { from, to } = editor.state.selection;
        editor.commands.setContent(initialContent, false); // `false` предотвращает запуск onUpdate
        // Восстанавливаем позицию курсора, если это необходимо
        if (editor.state.doc.content.size >= to) {
          editor.commands.setTextSelection({ from, to });
        }
      }
    }
  }, [initialContent, editor, debouncedContentChange]);

  // Возвращаем только editor, так как localContent больше не нужен
  return { editor };
};
