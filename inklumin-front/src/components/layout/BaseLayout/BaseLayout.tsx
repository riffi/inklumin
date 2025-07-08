import { Outlet } from "react-router-dom";
import { AppShell, Box, Burger, Group, Text } from "@mantine/core";
import { NavbarNested } from "@/components/layout/NavbarNested/NavbarNested";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import {
  ActionItem,
  RowActionButtons,
} from "@/components/shared/RowActionButtons/RowActionButtons";
import { useBookDbConnection } from "@/hooks/useBookDbConnection";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const BaseLayout = () => {
  const { isNavbarOpened, toggleNavbarOpened } = useUiSettingsStore();
  const { header } = useMobileHeader();
  // Подключаемся к базе данных выбранного произведения
  useBookDbConnection();
  const { isMobile } = useMedia();
  return (
    <>
      <AppShell
        header={{
          height: { base: 50, sm: 0, lg: 0 },
        }}
        navbar={{
          width: isNavbarOpened ? 300 : 60,
          breakpoint: "sm",
          collapsed: { mobile: !isNavbarOpened },
        }}
        padding={isMobile ? "0" : "md"}
        styles={{
          main: {
            backgroundColor: "rgb(246 251 255)",
          },
        }}
      >
        <AppShell.Header>
          {/* nowrap гарантирует, что контент не переносится, даже если текста много */}
          <Group px="md" justify="space-between" align="center" gap="10" wrap="nowrap">
            <Burger
              opened={isNavbarOpened}
              onClick={toggleNavbarOpened}
              hiddenFrom="sm"
              lineSize={1}
              size="lg"
            />
            <Box
              style={{
                flexGrow: 1,
                textAlign: "center",
                minWidth: 0, // позволяет дочернему flex-элементу сжиматься
              }}
            >
              {isMobile && header && (
                <Group
                  gap="sm"
                  justify="center"
                  align="center"
                  wrap="nowrap"
                  style={{ width: "100%" }}
                >
                  {/* Левая часть: иконка + заголовок с минимальным зазором */}
                  <Group
                    gap="xs"
                    align="center"
                    wrap="nowrap"
                    justify="center"
                    style={{ flexGrow: 1, minWidth: 0 }}
                  >
                    {header.icon && (
                      <IconViewer
                        icon={header.icon}
                        size={24}
                        color="var(--mantine-color-gray-6)"
                      />
                    )}
                    <Text
                      fw={500}
                      c="var(--mantine-color-gray-6)"
                      // Обрезаем длинный текст и добавляем многоточие
                      style={{
                        // flexGrow: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {header.title}
                    </Text>
                  </Group>

                  {header.actions && header.actions.length > 0 && (
                    <RowActionButtons actions={header.actions} />
                  )}
                </Group>
              )}
            </Box>
            {/** RowActionButtons уже содержит Drawer */}
          </Group>
        </AppShell.Header>

        <AppShell.Navbar>
          <NavbarNested toggleNavbar={toggleNavbarOpened} opened={isNavbarOpened} />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
};
