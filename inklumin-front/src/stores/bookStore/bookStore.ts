import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IBook } from "@/entities/BookEntities";

interface BookStore {
  selectedBook: IBook | null;
  selectBook: (book: IBook) => void;
  clearSelectedBook: () => void;
  collapsedChapters: Map<number, boolean>;
  toggleChapterCollapse: (chapterId: number) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set) => ({
      selectedBook: null,
      collapsedChapters: new Map<number, boolean>(),
      selectBook: (book) => set({ selectedBook: book }),
      clearSelectedBook: () => set({ selectedBook: null, collapsedChapters: new Map() }),
      toggleChapterCollapse: (chapterId) => {
        // Меняем состояние одной главы без затрагивания остальных
        set((state) => {
          // Проверяем, изменится ли значение
          const currentValue = state.collapsedChapters.get(chapterId) || false;
          const newValue = !currentValue;

          // Если значение не меняется, возвращаем текущее состояние
          if (currentValue === newValue) return state;

          const map = new Map(state.collapsedChapters);
          map.set(chapterId, newValue);
          return { collapsedChapters: map };
        });
      },
    }),
    {
      name: "selected-book-storage",
      partialize: (state) => ({
        ...state,
        collapsedChapters: Array.from(state.collapsedChapters.entries()),
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        collapsedChapters: new Map((persisted.collapsedChapters as [number, boolean][]) || []),
      }),
    }
  )
);
