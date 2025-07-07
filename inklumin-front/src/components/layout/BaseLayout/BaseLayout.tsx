import { useState } from "react";
import { IconDots } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import { ActionIcon, AppShell, Box, Burger, Drawer, Group, Stack, Text } from "@mantine/core";
import { NavbarNested } from "@/components/layout/NavbarNested/NavbarNested";
import { IconViewer } from "@/components/shared/IconViewer/IconViewer";
import { useBookDbConnection } from "@/hooks/useBookDbConnection";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const BaseLayout = () => {
  const { isNavbarOpened, toggleNavbarOpened } = useUiSettingsStore();
  const { header } = useMobileHeader();
  const [drawerOpened, setDrawerOpened] = useState(false);
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
          <Group px="md" justify="space-between" align="center" gap="10">
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
              }}
            >
              {isMobile && header && (
                <Group gap="sm" justify="center" align="center" style={{display: "flex"}}>
                  <Group style={{flexGrow: 1, justifyContent: "center"}}>
                    {header.icon && <IconViewer icon={header.icon} size={24} color={"var(--mantine-color-gray-6)"} />}
                    <Text fw={500} color={"var(--mantine-color-gray-6)"}>{header.title}</Text>
                  </Group>
                  {header.actions && header.actions.length > 0 && (
                    <ActionIcon variant="subtle" onClick={() => setDrawerOpened(true)}>
                      <IconDots size={20} />
                    </ActionIcon>
                  )}
                </Group>
              )}
            </Box>
            {header?.actions && (
              <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="bottom"
                size="25%"
              >
                <Stack gap="0">
                  {header.actions.map((action, index) => (
                    <Group
                      key={index}
                      gap="sm"
                      onClick={() => {
                        action.handler();
                        setDrawerOpened(false);
                      }}
                      style={{
                        cursor: "pointer",
                        paddingTop: 8,
                        paddingBottom: 8,
                        borderBottom:
                          index < header.actions.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none",
                      }}
                    >
                      <ActionIcon variant="subtle">{action.icon}</ActionIcon>
                      <Text size="lg">{action.title}</Text>
                    </Group>
                  ))}
                </Stack>
              </Drawer>
            )}
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
