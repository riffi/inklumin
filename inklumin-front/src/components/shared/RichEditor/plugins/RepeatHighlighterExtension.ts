// RepeatHighlighterExtension.ts
import { PluginKey } from "prosemirror-state";
import { IRepeatWarning } from "../types";
import { BaseHighlighterExtension } from "./base/BaseHighligherExtension";

export const REPEAT_HIGHLIGHTER_NAME = "repeatHighlighter";
export const repeatHighlighterKey = new PluginKey(REPEAT_HIGHLIGHTER_NAME);

export const RepeatHighlighterExtension = BaseHighlighterExtension<IRepeatWarning>({
  pluginKey: repeatHighlighterKey,
  pluginName: REPEAT_HIGHLIGHTER_NAME,
  decorationClass: "highlighted-repeat",
  title: "Слово дублируется",
  createDecorAttrs: (warning) => ({
    "data-word": warning.text,
    "data-group-index": warning.groupIndex,
  }),
});
