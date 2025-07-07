import { Outlet } from "react-router-dom";
import { AppShell, Burger, Group, Text } from "@mantine/core";
import { NavbarNested } from "@/components/layout/NavbarNested/NavbarNested";
import { useBookDbConnection } from "@/hooks/useBookDbConnection";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const SceneEditorLayout = () => {
  const { isNavbarOpened, toggleNavbarOpened } = useUiSettingsStore();
  const { pageTitle, titleElement } = useMobileHeader();
  // Подключаемся к базе данных выбранного произведения
  useBookDbConnection();
  const { isMobile } = useMedia();
  const hideHeader = isMobile;
  return (
    <>
      <AppShell
        header={{
          height: hideHeader ? 0 : { base: 50, sm: 0, lg: 0 },
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
        {!hideHeader && (
          <AppShell.Header>
            <Group px="md" justify="space-between" align="center" gap="0">
              <Burger
                opened={isNavbarOpened}
                onClick={toggleNavbarOpened}
                hiddenFrom="sm"
                lineSize={1}
                size="lg"
              />
              {(isMobile && titleElement) || (
                <Text fw={500} hiddenFrom="sm">
                  {pageTitle}
                </Text>
              )}
            </Group>
          </AppShell.Header>
        )}

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
