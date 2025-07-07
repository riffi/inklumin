import { IconArrowRight, IconBook, IconNotes, IconSettingsAutomation } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

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
    // Используем Container для центрирования и ограничения ширины контента
    <Container size="lg" my="xl">
      {/* Оборачиваем всё в Paper для создания эффекта карточки/панели с тенью и скруглениями */}
      <Paper p={{ base: "lg", md: "xl" }} withBorder radius="md">
        <Stack justify="center" align="stretch" spacing="xl">
          {/* Заголовок и описание */}
          <Stack align="center" spacing="md" ta="center">
            <Title order={1}>Добро пожаловать в InkLumin!</Title>
            <Text size="lg" c="dimmed" maw={650}>
              InkLumin — ваш персональный набор инструментов для писателя. Организуйте произведения,
              структурируйте сцены, храните заметки и настраивайте базу знаний персонажей и локаций.
              Всё, что нужно для творчества, — в одном месте.
            </Text>
          </Stack>

          {/* Список ключевых возможностей */}
          <List
            spacing="md"
            size="md"
            center
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconArrowRight size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>Создавайте книги и материалы, разбивайте текст на главы и сцены.</List.Item>
            <List.Item>Ведите подробные заметки, чтобы идеи никогда не терялись.</List.Item>
            <List.Item>
              Используйте конфигуратор, чтобы определить структуру базы знаний: персонажи, локации,
              сюжетные линии и многое другое.
            </List.Item>
          </List>

          {/* Карточки с быстрыми ссылками */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt="lg">
            {/* Каждая карточка в отдельном компоненте для чистоты кода, но для простоты оставим здесь */}
            <Card withBorder shadow="sm" radius="md" p="xl">
              <Stack align="center" spacing="md" h="100%">
                <ThemeIcon variant="light" color="indigo" size={54} radius="md">
                  <IconBook size={28} />
                </ThemeIcon>
                <Title order={4}>Произведения</Title>
                <Text ta="center" size="sm" c="dimmed" style={{ flexGrow: 1 }}>
                  Создавайте и редактируйте книги, материалы, главы и сцены.
                </Text>
                <Button
                  component={Link}
                  to="/"
                  fullWidth
                  onClick={props.onStart}
                  variant="light"
                  rightSection={<IconArrowRight size={14} />}
                >
                  К произведениям
                </Button>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="xl">
              <Stack align="center" spacing="md" h="100%">
                <ThemeIcon variant="light" color="teal" size={54} radius="md">
                  <IconNotes size={28} />
                </ThemeIcon>
                <Title order={4}>Заметки</Title>
                <Text ta="center" size="sm" c="dimmed" style={{ flexGrow: 1 }}>
                  Храните идеи, исследования и мысли, организованные по папкам.
                </Text>
                <Button
                  component={Link}
                  to="/notes"
                  fullWidth
                  onClick={props.onStart}
                  variant="light"
                  rightSection={<IconArrowRight size={14} />}
                >
                  К заметкам
                </Button>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="xl">
              <Stack align="center" spacing="md" h="100%">
                <ThemeIcon variant="light" color="orange" size={54} radius="md">
                  <IconSettingsAutomation size={28} />
                </ThemeIcon>
                <Title order={4}>Конфигуратор</Title>
                <Text ta="center" size="sm" c="dimmed" style={{ flexGrow: 1 }}>
                  Если недостаточно шаблонов, настройте собственную структуру базы знаний.
                </Text>
                <Button
                  component={Link}
                  to="/configurator"
                  fullWidth
                  onClick={props.onStart}
                  variant="light"
                  rightSection={<IconArrowRight size={14} />}
                >
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
