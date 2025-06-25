import { ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { KnowledgeBaseViewer } from "@/components/knowledgeBase/KnowledgeBaseViewer";
import { BaseLayout } from "@/components/layout/BaseLayout/BaseLayout";
import { SceneEditorLayout } from "@/components/layout/SceneEditorLayout/SceneEditorLayout";
import { NoteEditPage } from "@/components/notes/NoteEditPage/NoteEditPage";
import { NoteFolder } from "@/components/notes/NoteFolder/NoteFolder";
import { NoteManager } from "@/components/notes/NoteManager/NoteManager";
import { SceneLayout } from "@/components/scenes/SceneLayout/SceneLayout";
import { BlockInstanceManagerPage } from "@/pages/books/BlockInstanceManagerPage";
import { BlockInstancePage } from "@/pages/books/BlockInstancePage";
import { BookAgentPage } from "@/pages/books/BookAgentPage";
import { BookDashboardPage } from "@/pages/books/BookDashboardPage";
import { BookReaderPage } from "@/pages/books/BookReaderPage";
import { BookSettingsPage } from "@/pages/books/BookSettingsPage";
import { BooksPage } from "@/pages/books/BooksPage";
import { BlockCard } from "@/pages/configurator/BlockCard";
import { ConfigurationCard } from "@/pages/configurator/ConfigurationCard";
import { Configurator } from "@/pages/configurator/Configurator";
import { SceneCard } from "@/pages/scenes/SceneCard";
import { ScenesPage } from "@/pages/scenes/ScenesPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { DbViewer } from "@/pages/tech/DbViewer";

const router = createBrowserRouter([
  {
    path: "/",
    element: (<BaseLayout />) as ReactNode,
    children: [
      {
        path: "/configurator",
        element: (<Configurator />) as ReactNode,
      },
      {
        path: "/settings",
        element: (<SettingsPage />) as ReactNode,
      },
      {
        path: "/configuration/edit",
        element: (<ConfigurationCard />) as ReactNode,
      },
      {
        path: "/block/edit",
        element: (<BlockCard />) as ReactNode,
      },
      {
        index: true,
        element: (<BooksPage />) as ReactNode,
      },
      {
        path: "/book/dashboard",
        element: (<BookDashboardPage />) as ReactNode,
      },
      {
        path: "/scenes",
        element: (<ScenesPage />) as ReactNode,
      },
      {
        path: "/block-instance/manager",
        element: (<BlockInstanceManagerPage />) as ReactNode,
      },
      {
        path: "/block-instance/card",
        element: (<BlockInstancePage />) as ReactNode,
      },
      {
        path: "/notes",
        element: (<NoteManager />) as ReactNode,
      },
      {
        path: "/book-notes",
        element: (<NoteManager bookNotesMode={true} />) as ReactNode,
      },
      {
        path: "/notes/folder/:folderUuid",
        element: (<NoteFolder />) as ReactNode,
      },
      {
        path: "/notes/new",
        element: (<NoteEditPage />) as ReactNode,
      },
      {
        path: "/notes/edit/:uuid",
        element: (<NoteEditPage />) as ReactNode,
      },
      {
        path: "/knowledge-base/:uuid",
        element: (<KnowledgeBaseViewer />) as ReactNode,
      },
      {
        path: "/db-viewer",
        element: (<DbViewer />) as ReactNode,
      },
      {
        path: "/book/reader",
        element: (<BookReaderPage />) as ReactNode,
      },
      {
        path: "/book/agent",
        element: (<BookAgentPage />) as ReactNode,
      },
      {
        path: "/book/settings",
        element: (<BookSettingsPage />) as ReactNode,
      },
    ],
  },
  {
    path: "/scene/card",
    element: (<SceneEditorLayout />) as ReactNode,
    children: [
      {
        index: true,
        element: (<SceneCard />) as ReactNode,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
