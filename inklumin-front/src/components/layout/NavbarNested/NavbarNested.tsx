import React, { useMemo } from "react"; // Removed useState

import {
  IconBooks,
  IconBox,
  IconBrandDatabricks,
  IconBulb, // Added IconBulb
  IconDashboard,
  IconDatabaseCog,
  IconGraph,
  IconMessageChatbot,
  IconNotes,
  IconSettings,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom"; // Added useNavigate
import { CollapsedNavbar } from "@/components/layout/NavbarNested/parts/CollapsedNavbar/CollapsedNavbar";
import { ExpandedNavbar } from "@/components/layout/NavbarNested/parts/ExpandedNavbar/ExpandedNavbar";
import { bookDb } from "@/entities/bookDb";
import {
  IBlock,
  IBlockStructureKind,
  IBookConfiguration,
  IIcon,
} from "@/entities/ConstructorEntities";
import { useConnection } from "@/providers/ConnectionStatusProvider/ConnectionStatusProvider";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { ConfigurationRepository } from "@/repository/ConfigurationRepository";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { getBlockTitle } from "@/utils/configUtils";

export interface NavLinkItem {
  label: string;
  link?: string;
  icon?: IIcon;
}

export interface NavLinkGroup {
  label: string;
  icon: React.FC<any>;
  initiallyOpened?: boolean;
  links?: NavLinkItem[];
  link?: string;
  onClick?: () => Promise<void>; // Added onClick handler
}

const BASE_MENU_ITEMS: NavLinkGroup[] = [
  {
    label: "Общее",
    icon: IconBox,
    links: [
      {
        label: "Конфигуратор",
        link: "/configurator",
      },
      {
        label: "Заметки",
        link: "/notes",
      },
      {
        label: "Произведения",
        link: "/",
      },
      {
        label: "Настройки",
        link: "/settings",
      },
      {
        label: "База данных",
        link: "/db-viewer",
      },
    ],
  },
];

const getBlockPageTitle = (block: IBlock) => {
  return getBlockTitle(block);
};

export const NavbarNested = ({
  toggleNavbar,
  opened,
}: {
  toggleNavbar?: () => void;
  opened: boolean;
}) => {
  const { selectedBook } = useBookStore();
  const navigate = useNavigate(); // Hook for navigation
  const { isOnline } = useConnection(); // Get connection status
  const chapterOnlyMode = selectedBook?.chapterOnlyMode === 1;

  const handleQuickNoteClick = React.useCallback(() => {
    // Wrapped with useCallback
    navigate("/notes/new");
  }, [navigate]);

  const blocks = useLiveQuery<IBlock[]>(() => {
    return selectedBook ? BlockRepository.getAll(bookDb) : [];
  }, [selectedBook]);

  const bookConfiguration = useLiveQuery<IBookConfiguration>(async () => {
    return selectedBook ? ConfigurationRepository.getFirst(bookDb) : null;
  }, [selectedBook]);

  const { baseItems, dynamicItems } = useMemo(() => {
    const quickNoteItem: NavLinkGroup = {
      label: "Быстрая заметка",
      icon: IconBulb,
      onClick: handleQuickNoteClick, // This function reference is now stable
    };
    const dynamicItems: NavLinkGroup[] = [];

    if (selectedBook) {
      dynamicItems.push({ label: "Рабочий стол", icon: IconDashboard, link: "/book/dashboard" });
      if (selectedBook.kind === "book") {
        dynamicItems.push({
          label: chapterOnlyMode ? "Главы" : "Сцены",
          icon: IconNotes,
          link: "/scenes",
        });
      }
      dynamicItems.push({
        label: `Заметки ${selectedBook.kind === "book" ? "произведения" : "материала"}`,
        icon: IconGraph,
        link: "/book-notes",
      });

      if (selectedBook.kind === "book") {
        dynamicItems.push({ label: "Чтение", icon: IconBooks, link: "/book/reader" });
      }

      dynamicItems.push({ label: "Помощник", icon: IconMessageChatbot, link: "/book/agent" });

      const blockLinks =
        blocks
          ?.filter((b) => !b.parentBlockUuid && b.showInMainMenu === 1)
          .map((b) => ({
            label: getBlockPageTitle(b),
            icon: b.icon,
            link: `/block-instance/manager?uuid=${b.uuid}`,
          })) || [];
      if (blockLinks.length > 0) {
        dynamicItems.push({
          label: "База знаний",
          icon: IconBrandDatabricks,
          links: blockLinks,
        });
      }

      dynamicItems.push({
        label: "Конфигурация",
        icon: IconDatabaseCog,
        link: `/configuration/edit/?uuid=${bookConfiguration?.uuid}&bookUuid=${selectedBook.uuid}`,
      });

      dynamicItems.push({
        label: `Настройки ${selectedBook.kind === "book" ? "произведения" : "материала"}`,
        icon: IconSettings,
        link: "/book/settings",
      });
    }

    return {
      baseItems: [quickNoteItem, ...BASE_MENU_ITEMS], // Prepend quick note item
      dynamicItems,
    };
  }, [selectedBook, blocks, handleQuickNoteClick, bookConfiguration]); // Include bookConfiguration to update menu when it changes

  if (!opened) {
    return (
      <CollapsedNavbar
        opened={opened}
        toggleNavbar={toggleNavbar}
        baseItems={baseItems}
        dynamicItems={dynamicItems}
        isOnline={isOnline} // Pass isOnline
      />
    );
  }

  return (
    <ExpandedNavbar
      opened={opened}
      toggleNavbar={toggleNavbar}
      baseItems={baseItems}
      dynamicItems={dynamicItems}
      isOnline={isOnline} // Pass isOnline
    />
  );
};
