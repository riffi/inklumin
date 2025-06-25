import { useState } from "react";
import { IconTextSpellcheck } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Button } from "@mantine/core";
import { OpenRouterApi } from "@/api/openRouterApi";
import { YandexSpellerApi } from "@/api/yandexSpellerApi";

interface SpellingActionProps {
  editor: ReturnType<typeof useEditor>;
  onLoadingChange: (isLoading: boolean, message?: string) => void;
  onFound: (corrections: string[]) => void;
}

export const SpellingAction = ({ editor, onLoadingChange, onFound }: SpellingActionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      alert("Выделите текст для проверки");
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true, "Проверяем орфографию...");
      const result = await YandexSpellerApi.fetchSpellingCorrection(selectedText);
      const applyYandexCorrections = (originalText: string, corrections: any[]): string => {
        let text = originalText;
        let offset = 0;
        corrections.forEach((correction) => {
          if (correction.s && correction.s.length > 0) {
            const start = correction.pos + offset;
            const end = start + correction.len;
            const replacement = correction.s[0];
            text = text.slice(0, start) + replacement + text.slice(end);
            offset += replacement.length - correction.len;
          }
        });
        return text;
      };
      const correction = applyYandexCorrections(selectedText, result);
      onFound([correction]);
    } catch (error) {
      console.error("Error fetching spelling correction:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={isLoading}
      leftSection={<IconTextSpellcheck size={16} />}
      variant="outline"
    >
      Орфография
    </Button>
  );
};
