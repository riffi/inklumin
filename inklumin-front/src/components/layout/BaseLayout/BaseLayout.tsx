import { Outlet } from "react-router-dom";
import { AppShell, Box, Burger, Group, Text } from "@mantine/core";
import { NavbarNested } from "@/components/layout/NavbarNested/NavbarNested";
import { useBookDbConnection } from "@/hooks/useBookDbConnection";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { usePageTitle } from "@/providers/PageTitleProvider/PageTitleProvider";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const BaseLayout = () => {
  const { isNavbarOpened, toggleNavbarOpened } = useUiSettingsStore();
  const { pageTitle, titleElement } = usePageTitle();
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
          <Group px="md" justify="flex-start" align="center" gap="10">
            <Burger
              opened={isNavbarOpened}
              onClick={toggleNavbarOpened}
              hiddenFrom="sm"
              lineSize={1}
              size="lg"
            />
            <Box style={{
              flexGrow: 1,
              textAlign: "center"
            }}>
              {(isMobile && titleElement) || (
                <Text fw={500} hiddenFrom="sm">
                  {pageTitle}
                </Text>
              )}
            </Box>
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
