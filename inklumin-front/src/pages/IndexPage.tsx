import { useState } from "react";
import { BooksPage } from "@/pages/books/BooksPage";
import { WelcomePage } from "@/pages/welcome/WelcomePage";

export const IndexPage = () => {
  const [visited, setVisited] = useState(localStorage.getItem("welcomeShown") === "1");

  const handleStart = () => {
    localStorage.setItem("welcomeShown", "1");
    setVisited(true);
  };

  return visited ? <BooksPage /> : <WelcomePage onStart={handleStart} />;
};
