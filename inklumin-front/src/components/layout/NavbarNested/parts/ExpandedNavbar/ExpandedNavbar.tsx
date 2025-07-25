// ExpandedNavbar.tsx
import { useMemo } from "react";
import { IconBooks, IconChevronRight, IconMicroscope, IconWifiOff } from "@tabler/icons-react"; // Added IconWifiOff

import { useNavigate } from "react-router-dom";
import {
  Box,
  Burger,
  Code,
  Collapse,
  Divider,
  Group,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { NavLinkGroup } from "@/components/layout/NavbarNested/NavbarNested";
import { Logo } from "@/components/layout/NavbarNested/parts/logo/Logo";
import { UserButton } from "@/components/layout/UserButton/UserButton";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useBookStore } from "@/stores/bookStore/bookStore";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";
import config from "../../../../../../package.json";
import classes from "./ExpandedNavbar.module.css";

interface NavLinkProps extends NavLinkGroup {
  toggleNavbar?: () => void;
  isBaseItem?: boolean; // Новый пропс для стилизации
}
const NavLink = ({
  icon: Icon,
  label,
  initiallyOpened = false,
  links,
  link,
  onClick, // Added onClick
  toggleNavbar,
  isBaseItem = false, // Значение по умолчанию
}: NavLinkProps) => {
  const navigate = useNavigate();
  const { navbarLinkStates, setNavbarLinkState } = useUiSettingsStore();
  const opened = navbarLinkStates[label] ?? initiallyOpened;
  const hasLinks = links && links.length > 0;
  const { isMobile } = useMedia();

  const handleClick = async () => {
    // Made async
    if (onClick) {
      // Check for onClick first
      await onClick();
      if (isMobile && !link && !hasLinks) {
        // If it's purely an action button, toggle navbar on mobile
        toggleNavbar?.();
      }
      return;
    }
    if (link) {
      navigate(link);
      if (isMobile) {
        toggleNavbar?.();
      }
    } else if (hasLinks) {
      setNavbarLinkState(label, !opened);
    }
  };

  const linkItems = useMemo(
    () =>
      hasLinks
        ? links.map((item) => (
            <Text<"a">
              component="a"
              flex={4}
              href={item.link}
              key={item.label}
              className={classes.link}
              style={
                item.link === location.pathname + location.search
                  ? { backgroundColor: "var(--mantine-color-blue-0)" }
                  : {}
              }
              onClick={(e) => {
                e.preventDefault();
                navigate(item.link || "#");
                if (isMobile) {
                  toggleNavbar?.();
                }
              }}
            >
              <Group justify="flex-start" gap={0}>
                <IconViewer
                  icon={item.icon}
                  size={20}
                  backgroundColor={"transparent"}
                  color="var(--mantine-color-blue-7)"
                />
                <div style={{ marginLeft: "10px" }}>{item.label}</div>
              </Group>
            </Text>
          ))
        : null,
    [hasLinks, links, navigate, toggleNavbar, location.pathname, location.search, isMobile]
  ); // Added isMobile

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        className={isBaseItem ? classes.baseControl : classes.control} // Разные стили
        aria-expanded={hasLinks ? opened : undefined}
        style={
          link === location.pathname + location.search
            ? { backgroundColor: "var(--mantine-color-blue-0)" }
            : {}
        }
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon
              variant={isBaseItem ? "filled" : "light"} // Разные варианты иконок
              size={30}
              color={isBaseItem ? "blue" : undefined}
            >
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md" fw={isBaseItem ? 700 : 500}>
              {" "}
              {/* Разная толщина текста */}
              {label}
            </Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{
                transform: opened ? "rotate(-90deg)" : "none",
                transition: "transform 200ms ease",
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks && (
        <Collapse in={opened} transitionDuration={200}>
          {linkItems}
        </Collapse>
      )}
    </>
  );
};

export const ExpandedNavbar = ({
  opened,
  toggleNavbar,
  baseItems,
  dynamicItems,
  isOnline, // Added isOnline prop
}: {
  opened: boolean;
  toggleNavbar?: () => void;
  baseItems: NavLinkGroup[];
  dynamicItems: NavLinkGroup[];
  isOnline: boolean; // Added isOnline prop type
}) => {
  const { selectedBook } = useBookStore();
  const { isMobile } = useMedia(); // Get media query info

  return (
    <nav className={classes.navbar} aria-label="Основное меню">
      <div className={classes.header}>
        <Group justify="space-between" align="center">
          {" "}
          {/* Added align="center" for better vertical alignment */}
          <Logo style={{ width: 120 }} />
          {/* Combined right-side items into a new Group for better layout control */}
          <Group gap="xs" align="center">
            {isMobile && !isOnline && (
              <IconWifiOff size={26} stroke={1.5} color="orange" style={{ marginRight: "8px" }} />
            )}
            <Code fw={700}>{config.version}</Code>
            <Burger
              opened={opened}
              onClick={toggleNavbar}
              visibleFrom="sm"
              lineSize={1}
              size="sm"
            />
            {!isMobile && !isOnline && (
              <IconWifiOff size={24} stroke={1.5} color="orange" style={{ marginLeft: "8px" }} />
            )}
          </Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {baseItems.map((item) => (
            <NavLink {...item} key={item.label} isBaseItem toggleNavbar={toggleNavbar} />
          ))}
          <Divider my="sm" />
          {selectedBook && (
            <Box px="md" py="sm">
              <Group gap="xs" align="center">
                {selectedBook.kind === "book" && (
                  <IconBooks
                    size={18}
                    color="var(--mantine-color-blue-6)"
                    style={{ marginRight: "var(--mantine-spacing-xs)" }}
                  />
                )}
                {selectedBook.kind === "material" && (
                  <IconMicroscope
                    size={18}
                    color="var(--mantine-color-blue-6)"
                    style={{ marginRight: "var(--mantine-spacing-xs)" }}
                  />
                )}
                <Text fw={700} truncate style={{ maxWidth: 180 }}>
                  {selectedBook.title}
                </Text>
              </Group>
            </Box>
          )}
          {dynamicItems.map((item) => (
            <NavLink {...item} key={item.label} toggleNavbar={toggleNavbar} />
          ))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
};
