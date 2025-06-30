import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, LoadingOverlay } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const DocViewer = () => {
  const { "*": subPath } = useParams();
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!subPath) return;
      setLoading(true);
      const res = await fetch(`/documentation/${subPath}.md`);
      const text = res.ok ? await res.text() : "# Документация не найдена";
      setMarkdown(text);
      setLoading(false);
    };
    load();
  }, [subPath]);

  if (loading) return <LoadingOverlay visible />;
  return (
    <Container>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </Container>
  );
};
