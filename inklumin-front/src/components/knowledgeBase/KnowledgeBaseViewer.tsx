import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { Container, LoadingOverlay } from "@mantine/core";
import { useDb } from "@/hooks/useDb";
import { IKnowledgeBasePage } from "@/entities/KnowledgeBaseEntities";
import { loadSystemKnowledgeBasePage } from "@/knowledge-base/loader";
import { KnowledgeBaseRepository } from "@/repository/KnowledgeBaseRepository";

interface KnowledgeBaseViewerProps {
  uuid?: string;
  bookUuid?: string;
}

export const KnowledgeBaseViewer = ({ uuid, bookUuid }: KnowledgeBaseViewerProps) => {
  const params = useParams();
  const pageUuid = uuid || params.uuid!;
  const db = useDb(bookUuid);
  const [page, setPage] = useState<IKnowledgeBasePage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let p = await KnowledgeBaseRepository.getByUuid(db, pageUuid);
      if (!p && !bookUuid) {
        p = await loadSystemKnowledgeBasePage(pageUuid);
      }
      setPage(p || null);
      setLoading(false);
    };
    load();
  }, [pageUuid, db, bookUuid]);

  if (loading) return <LoadingOverlay visible />;
  if (!page) return <Container>Страница не найдена</Container>;
  return (
    <Container>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.markdown}</ReactMarkdown>
    </Container>
  );
};
