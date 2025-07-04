import { Button, Card, Container, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowRight, IconBook, IconNotes, IconSettingsAutomation } from "@tabler/icons-react";
import { Link } from "react-router-dom";

/**
 * Компонент приветственной страницы, отображаемой при самом первом входе пользователя в систему.
 * Здесь содержится краткое описание возможностей InkLumin и быстрые ссылки на ключевые разделы.
 */
interface IWelcomePageProps {
  /**
   * Опциональный колбэк для сценариев, где необходимо выполнить дополнительное действие при старте.
   */
  onStart?: () => void;
}

export const WelcomePage = (props: IWelcomePageProps) => {
  return (
      <Container size={800} my="xl">
        <Paper p={"xl"}>
        <Stack justify="center" align="stretch" spacing="xl">
          {/* Заголовок и краткое описание */}
          <Stack align="center" spacing="sm">
            <Title order={1} ta="center">
              Добро пожаловать в InkLumin!
            </Title>
            <Text ta="center" size="lg" maw={600}>
              InkLumin — ваш персональный набор инструментов для писателя. Организуйте произведения, структурируйте сцены, храните заметки и
              настраивайте базу знаний персонажей и локаций. Всё, что нужно для творчества, — в одном месте.
            </Text>
          </Stack>

          {/* Краткий список основных действий */}
          <List
              spacing="sm"
              size="md"
              center
              icon={
                <ThemeIcon color="blue" size={24} radius="xl">
                  <IconArrowRight size={16} />
                </ThemeIcon>
              }
          >
            <List.Item>
              Создавайте книги и материалы, разбивайте текст на главы и сцены.
            </List.Item>
            <List.Item>
              Ведите подробные заметки, чтобы идеи никогда не терялись.
            </List.Item>
            <List.Item>
              Используйте конфигуратор, чтобы определить структуру базы знаний: персонажи, локации, сюжетные линии и многое другое.
            </List.Item>
          </List>

          {/* Быстрые ссылки */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Stack align="center" spacing="xs">
                <ThemeIcon color="indigo" size={48} radius="xl">
                  <IconBook size={28} />
                </ThemeIcon>
                <Title order={4}>Управление произведениями</Title>
                <Text ta="center" size="sm">
                  Создавайте и редактируйте книги, материалы, главы и сцены.
                </Text>
                <Button component={Link} to="/" fullWidth onClick={props.onStart}>
                  К произведениям
                </Button>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Stack align="center" spacing="xs">
                <ThemeIcon color="teal" size={48} radius="xl">
                  <IconNotes size={28} />
                </ThemeIcon>
                <Title order={4}>Заметки</Title>
                <Text ta="center" size="sm">
                  Храните идеи, исследования и мысли, организованные по папкам.
                </Text>
                <Button component={Link} to="/notes" fullWidth onClick={props.onStart}>
                  К заметкам
                </Button>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Stack align="center" spacing="xs">
                <ThemeIcon color="orange" size={48} radius="xl">
                  <IconSettingsAutomation size={28} />
                </ThemeIcon>
                <Title order={4}>Конфигуратор</Title>
                <Text ta="center" size="sm">
                  Если недостаточно шаблонов, настройте собственную структуру базы знаний: персонажи, локации, артефакты и их связи.
                </Text>
                <Button component={Link} to="/configurator" fullWidth onClick={props.onStart}>
                  К конфигуратору
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
        </Paper>
      </Container>
  );
};
