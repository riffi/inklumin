import React, { useState } from "react";
import { IconDots } from "@tabler/icons-react";
import { ActionIcon, Drawer, Group, Stack, Text, Menu } from "@mantine/core";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

export interface ActionItem {
  title: string;
  icon: React.ReactNode;
  handler: () => void;
  color?: string;
  variant?: string;
  active?: boolean;
}

// Интерфейс для свойств компонента
interface IRowActionButtonsProps {
  actions: ActionItem[];
  entityId?: string;
  drawerTitle?: string;
}

export const RowActionButtons = ({
  actions,
  entityId,
  drawerTitle = "Действия",
}: IRowActionButtonsProps) => {
  const { isMobile } = useMedia();
  const [openedDrawerId, setOpenedDrawerId] = useState<string | null>(null);

  const handleDrawerAction = (action: ActionItem) => {
    setOpenedDrawerId(null);
    action.handler();
  };

  const drawerId = entityId || "default";

  return (
    <Group gap={4} justify="center">
      {isMobile ? (
        <>
          <ActionIcon variant="subtle" onClick={() => setOpenedDrawerId(drawerId)}>
            <IconDots size={16} />
          </ActionIcon>

          <Drawer
            opened={openedDrawerId === drawerId}
            onClose={() => setOpenedDrawerId(null)}
            position="right"
            title={drawerTitle}
            // size="25%"
            styles={{
              body: { padding: 0 }, // или любое другое значение
            }}
          >
            <Stack gap="xs">
              {actions.map((action, index) => (
                <Group
                  key={index}
                  gap="sm"
                  onClick={() => handleDrawerAction(action)}
                  style={{
                    cursor: "pointer",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "8px",
                    backgroundColor: action.active ? "var(--mantine-color-blue-0)" : undefined,
                    borderBottom: index < actions.length - 1 ? "1px solid rgba(0,0,0,0.0.1)" : "none",
                  }}
                >
                  <ActionIcon
                    variant={"subtle"}
                    color={action.color || (action.active ? "blue" : undefined)}
                  >
                    {action.icon}
                  </ActionIcon>
                  <Text size="lg">{action.title}</Text>
                </Group>
              ))}
            </Stack>
          </Drawer>
        </>
      ) : (
        <Menu withinPortal={false} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {actions.map((action, index) => (
              <Menu.Item
                key={index}
                leftSection={action.icon}
                onClick={action.handler}
                color={action.color || (action.active ? "blue" : undefined)}
              >
                {action.title}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
};
