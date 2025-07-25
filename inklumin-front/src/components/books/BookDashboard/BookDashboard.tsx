// src/components/book/BookDashboard.tsx
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Container, Group, SimpleGrid, Title } from "@mantine/core";
import { DashboardBlockCard } from "@/components/books/BookDashboard/parts/DashboardBlockCard";
import { bookDb } from "@/entities/bookDb";
import { useMobileHeader } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { BlockRepository } from "@/repository/Block/BlockRepository";

export const BookDashboard = (bookUuid: string) => {
  const { setHeader } = useMobileHeader();
  const blocks = useLiveQuery(async () => {
    if (!bookUuid) return [];
    return BlockRepository.getAll(bookDb);
  }, [bookUuid]);

  const notNestedBlocks = blocks?.filter((block) => block.hostBlockUuid == null);

  useEffect(() => {
    setHeader({
      title: `Рабочий стол`,
    });
  }, [bookUuid]);

  return (
    <Container fluid p="md">
      <Group justify="space-between" mb="md" visibleFrom="sm">
        <Title order={2}>Рабочий стол произведения</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {notNestedBlocks?.map((block) => <DashboardBlockCard key={block.uuid} block={block} />)}
      </SimpleGrid>
    </Container>
  );
};
