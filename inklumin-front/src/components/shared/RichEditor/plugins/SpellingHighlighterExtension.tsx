// SpellingHighlighterExtension.tsx
import { PluginKey } from "prosemirror-state";
import { ISpellingWarning } from "../types";
import { BaseHighlighterExtension } from "./base/BaseHighligherExtension";

export const SPELLING_HIGHLIGHTER_NAME = "spellingHighlighter";
export const spellingHighlighterKey = new PluginKey(SPELLING_HIGHLIGHTER_NAME);

export const SpellingHighlighterExtension = BaseHighlighterExtension<ISpellingWarning>({
  pluginKey: spellingHighlighterKey,
  pluginName: SPELLING_HIGHLIGHTER_NAME,
  decorationClass: "highlighted-spelling",
  title: "Орфографическая ошибка",
  createDecorAttrs: (warning) => ({
    "data-suggestion": warning.suggestions?.[0] || "",
    "data-word": warning.text,
    "data-group-index": warning.groupIndex,
  }),
});
