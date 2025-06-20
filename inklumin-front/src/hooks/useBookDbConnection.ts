// hooks/useBookDbConnection.ts
import { useEffect } from "react";
import { bookDb, connectToBookDatabase } from "@/entities/bookDb";
import { useBookStore } from "@/stores/bookStore/bookStore";

export const useBookDbConnection = () => {
  const { selectedBook } = useBookStore();

  useEffect(() => {
    if (selectedBook && !bookDb) {
      connectToBookDatabase(selectedBook.uuid);
    }
  }, [selectedBook]);
};
