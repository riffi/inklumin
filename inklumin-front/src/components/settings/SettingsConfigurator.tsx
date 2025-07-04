// components/settings/SettingsConfigurator.tsx
import { Container, Paper, Tabs, Title } from "@mantine/core";
import { ApiSettingsTab } from "@/components/settings/parts/ApiSettingsTab";
import { BookBackupTab } from "@/components/settings/parts/BookBackupTab";
import { DatabaseTab } from "@/components/settings/parts/DatabaseTab";
import { NotesBackupTab } from "@/components/settings/parts/NotesBackupTab";

export const SettingsConfigurator = () => {
  return (
    <Container size="md">
      <Paper shadow="sm" radius="md" style={{ backgroundColor: "white" }} p="md">
        <Title order={2} mb="xl" fw={600}>
          Настройки системы
        </Title>
        <Tabs defaultValue="settings">
          <Tabs.List>
            <Tabs.Tab value="settings" icon={<span>⚙️</span>}>
              Настройки API
            </Tabs.Tab>
            <Tabs.Tab value="databases" icon={<span>📁</span>}>
              Управление БД
            </Tabs.Tab>
            <Tabs.Tab value="notes" icon={<span>📝</span>}>
              Управление заметками
            </Tabs.Tab>
            <Tabs.Tab value="books" icon={<span>📚</span>}>
              Произведения и материалы
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="settings" pt="lg">
            <ApiSettingsTab />
          </Tabs.Panel>

          <Tabs.Panel value="databases" pt="lg">
            <DatabaseTab />
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="lg">
            <NotesBackupTab />
          </Tabs.Panel>
          <Tabs.Panel value="books" pt="lg">
            <BookBackupTab />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};
