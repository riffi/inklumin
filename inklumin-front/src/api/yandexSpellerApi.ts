export class YandexSpellerApi {
  static async fetchSpellingCorrection(text: string): Promise<any[]> {
    const url = "https://speller.yandex.net/services/spellservice.json/checkText";

    const body = new URLSearchParams({ text }).toString(); // text=...

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Spelling check failed");
    }

    return response.json();
  }

  static async fetchSpellingGroups(text: string) {
    const data = await this.fetchSpellingCorrection(text);
    const { generateUUID } = await import("@/utils/UUIDUtils");
    const { IWarningKind } = await import("@/components/shared/RichEditor/types");
    const groups = data.map((item: any, index: number) => ({
      groupIndex: String(index),
      warningKind: IWarningKind.SPELLING,
      warnings: [
        {
          id: generateUUID(),
          from: item.pos + 1,
          to: item.pos + item.len + 1,
          groupIndex: String(index),
          text: item.word,
          kind: IWarningKind.SPELLING,
          suggestions: item.s,
          active: false,
        },
      ],
    }));
    return groups;
  }
}
