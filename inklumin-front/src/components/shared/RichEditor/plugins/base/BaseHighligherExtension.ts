// BaseHighlighterExtension.ts
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { repeatHighlighterKey } from "@/components/shared/RichEditor/plugins/RepeatHighlighterExtension";
import { IWarning, IWarningGroup, IWarningKind } from "@/components/shared/RichEditor/types";

export type HighlighterConfig<T extends IWarning> = {
  pluginKey: PluginKey;
  pluginName: string;
  decorationClass: string;
  title: string;
  createDecorAttrs: (warning: T) => Record<string, string>;
};

export const BaseHighlighterExtension = <T extends IWarning>(config: HighlighterConfig<T>) =>
  Extension.create({
    name: config.pluginName,
    addProseMirrorPlugins() {
      const pluginKey = config.pluginKey;

      const updatePositions = (tr: Transaction, groups: IWarningGroup[], newState: any) => {
        return groups
          .map((group) => ({
            ...group,
            warnings: group.warnings
              .map((warning) => {
                const newFrom = tr.mapping.map(warning.from);
                const newTo = tr.mapping.map(warning.to);
                return newFrom <= newTo && newTo <= newState.doc.content.size
                  ? { ...warning, from: newFrom, to: newTo }
                  : null;
              })
              .filter((w): w is T => w !== null),
          }))
          .filter((group) => group.warnings.length > 0);
      };

      const createDecorations = (groups: IWarningGroup[], doc: any) => {
        const decorations = groups.flatMap((group) =>
          group.warnings.map((warning) =>
            Decoration.inline(warning.from, warning.to, {
              class: `${config.decorationClass}${group.warnings.some((w) => (w as any).active) ? " active" : ""}`,
              title: config.title,
              ...config.createDecorAttrs(warning),
            })
          )
        );
        return DecorationSet.create(doc, decorations);
      };

      return [
        new Plugin({
          key: pluginKey,
          state: {
            init: () => ({
              decorations: DecorationSet.empty,
              warningGroups: [] as IWarningGroup[],
            }),
            apply: (tr, prev, oldState, newState) => {
              const meta = tr.getMeta(pluginKey);

              if (meta?.action === "UPDATE_DECORATIONS") {
                const groups = meta.warningGroups;
                return {
                  warningGroups: groups,
                  decorations: createDecorations(groups, newState.doc),
                };
              }

              if (meta?.action === "ACTIVATE_GROUP") {
                const { groupIndex } = meta;
                const updatedGroups = prev.warningGroups.map((group) => {
                  return {
                    ...group,
                    warnings: group.warnings.map((warning) => ({
                      ...warning,
                      active: group.groupIndex === groupIndex,
                    })),
                  };
                });
                return {
                  warningGroups: updatedGroups,
                  decorations: createDecorations(updatedGroups, newState.doc),
                };
              }

              const updatedGroups = updatePositions(tr, prev.warningGroups, newState);
              return {
                warningGroups: updatedGroups,
                decorations: createDecorations(updatedGroups, newState.doc),
              };
            },
          },
          props: {
            decorations(state) {
              return this.getState(state)?.decorations;
            },
            handleClick: (view, pos, event) => {
              const target = event.target as HTMLElement;
              const pluginState = pluginKey.getState(view.state);
              if (!pluginState || !target.classList.contains(config.decorationClass)) return false;

              const groupIndex = target.dataset.groupIndex;

              view.dispatch(
                view.state.tr
                  .setMeta(pluginKey, {
                    action: "ACTIVATE_GROUP",
                    groupIndex,
                  })
                  .setSelection(TextSelection.create(view.state.doc, view.state.selection.from))
              );
              return true;
            },
          },
        }),
      ];
    },
  });
