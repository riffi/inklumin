import { Button, Container, Stack, Text, Title } from "@mantine/core";

interface WelcomePageProps {
  onStart: () => void;
}
export const WelcomePage = ({ onStart }: WelcomePageProps) => {
  return (
    <Container size={600} my="xl">
      <Stack justify="center" align="center">
        <Title order={1}>Добро пожаловать в InkLumin!</Title>
        <Text ta="center">Это приложение поможет вам организовать ваши тексты и заметки.</Text>
        <Button onClick={onStart}>Начать работу</Button>
      </Stack>
    </Container>
  );
};
