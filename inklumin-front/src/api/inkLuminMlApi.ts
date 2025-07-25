import { notifications } from "@mantine/notifications";
import { ApiResponse } from "@/api/inkLuminApi/generatedTypes";
import { inkLuminAPI } from "@/api/inkLuminApi/inkLuminApi";
import { IWarningGroup, IWarningKind } from "@/components/shared/RichEditor/types";
import { IBlockTitleForms } from "@/entities/ConstructorEntities";
import { generateUUID } from "@/utils/UUIDUtils";

export class InkLuminApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InkLuminApiError";
  }
}

const fetchWithAuth = async <T>(
  request: (token: string) => Promise<ApiResponse<T>>
): Promise<T> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new InkLuminApiError("User not authenticated");
    }

    const response = await request(token);
    if (!response.success) {
      throw new InkLuminApiError(response.message || "Server error");
    }
    return response.data as T;
  } catch (error) {
    if (error instanceof InkLuminApiError) {
      throw error;
    }
    throw new InkLuminApiError((error as Error).message);
  }
};

/**
 * Получает формы слова из API и преобразует их в формат IBlockTitleForms
 * @param phrase Фраза для анализа
 * @returns Объект с формами слова
 */
export const fetchAndPrepareTitleForms = async (phrase: string): Promise<IBlockTitleForms> => {
  try {
    const formsData = await fetchWithAuth((token) => inkLuminAPI.getTitleForms(token, phrase));

    return {
      nominative: formsData.nomn || phrase,
      genitive: formsData.gent || "",
      dative: formsData.datv || "",
      accusative: formsData.accs || "",
      instrumental: formsData.ablt || "",
      prepositional: formsData.loct || "",
      plural: formsData.plural_nomn || "",
    };
  } catch (error) {
    throw new InkLuminApiError(error.message);
  }
};

export const fetchRepeats = async (text: string): Promise<IWarningGroup[]> => {
  try {
    const data = await fetchWithAuth((token) => inkLuminAPI.getRepeats(token, text, 10, 1));

    const groups: IWarningGroup[] = [];
    data.repeatData.forEach((rawGroup: any, index: number) => {
      const group: IWarningGroup = {
        groupIndex: String(index),
        warningKind: IWarningKind.REPEAT,
        warnings: rawGroup.repeats.map((repeat: any) => ({
          id: generateUUID(),
          from: repeat.startPosition + 1,
          to: repeat.endPosition + 2,
          groupIndex: String(index),
          text: repeat.word,
          kind: IWarningKind.REPEAT,
        })),
      };
      groups.push(group);
    });

    return groups;
  } catch (error) {
    notifications.show({
      title: "Ошибка запроса",
      message: error instanceof Error ? error.message : "Ошибка при проверке повторений",
      color: "red",
    });
    return [];
  }
};

export const fetchCliches = async (text: string): Promise<IWarningGroup[]> => {
  try {
    const data = await fetchWithAuth((token) => inkLuminAPI.getCliches(token, text));

    const groups: IWarningGroup[] = [];
    data.data.forEach((warning: any, index: number) => {
      const group: IWarningGroup = {
        groupIndex: String(index),
        warningKind: IWarningKind.CLICHE,
        warnings: [
          {
            id: generateUUID(),
            from: warning.start + 1,
            to: warning.end + 1,
            groupIndex: String(index),
            text: warning.text,
            kind: IWarningKind.CLICHE,
            active: false,
          },
        ],
      };
      groups.push(group);
    });

    return groups;
  } catch (error) {
    notifications.show({
      title: "Ошибка запроса",
      message: error instanceof Error ? error.message : "Ошибка при проверке штампов",
      color: "red",
    });
    return [];
  }
};

export const InkLuminMlApi = {
  fetchAndPrepareTitleForms,
  fetchRepeats,
  fetchCliches,
};
