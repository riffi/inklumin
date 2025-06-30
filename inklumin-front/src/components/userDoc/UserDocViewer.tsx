import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { Container, LoadingOverlay } from "@mantine/core";
import { IUserDocPage } from "@/entities/ConstructorEntities";
import { useDb } from "@/hooks/useDb";
import { UserDocRepository } from "@/repository/UserDocRepository";

interface UserDocViewerProps {
  uuid?: string;
  bookUuid?: string;
}

export const UserDocViewer = ({ uuid, bookUuid }: UserDocViewerProps) => {
  const params = useParams();
  const pageUuid = uuid || params.uuid!;
  const db = useDb(bookUuid);
  const [page, setPage] = useState<IUserDocPage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let p = await UserDocRepository.getByUuid(db, pageUuid);
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
