import { OpenRouterApi } from "@/api/openRouterApi";
import { bookDb } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";
import { BookRepository } from "@/repository/Book/BookRepository";
import { SceneRepository } from "@/repository/Scene/SceneRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { bookDbInfo } from "./bookDbInfo";

interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

interface Tool {
  definition: ToolDefinition;
  handler: (args: any) => Promise<any>;
}

// Определение доступных функций для агента
const tools: Record<string, Tool> = {
  getScene: {
    definition: {
      name: "getScene",
      description: "Получить текст сцены по идентификатору. Функция должна вызываться только для одного id за раз",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer", description: "ID сцены" },
        },
        required: ["id"],
      },
    },
    handler: async ({ id }) => {
      const scene = await SceneRepository.getById(bookDb, Number(id));
      if (!scene) return null;
      return { id: scene.id, title: scene.title, body: scene.body };
    },
  },
  listScenes: {
    definition: {
      name: "listScenes",
      description:
          "Возвращает **уже отсортированный** список сцен книги. " +
          "Сцены расположены в порядке возрастания поля `order` (порядковый номер), " +
          "а не `id`.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const scenes = await SceneRepository.getAll(bookDb);
      return scenes.map((s) => ({ id: s.id, title: s.title, order: s.order }));
    },
  },
  searchBlockInstances: {
    definition: {
      name: "searchBlockInstances",
      description:
        "Поиск экземпляров блоков по названию. Можно указать uuid блока",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Текст для поиска" },
          blockUuid: { type: "string", description: "UUID блока" },
        },
        required: ["query"],
      },
    },
    handler: async ({ query, blockUuid }) => {
      const blocks = blockUuid
        ? await BlockRepository.getByUuid(bookDb, blockUuid)
          ? [await BlockRepository.getByUuid(bookDb, blockUuid)]
          : []
        : await BlockRepository.getAll(bookDb);
      const results = [] as any[];
      for (const block of blocks) {
        const inst = await BlockInstanceRepository.getBlockInstances(
          bookDb,
          block.uuid,
          query
        );
        results.push(
          ...inst.map((i) => ({ uuid: i.uuid, title: i.title, block: block.title }))
        );
      }
      return results;
    },
  },
  listBlocks: {
    definition: {
      name: "listBlocks",
      description: "Получить список блоков книги",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const blocks = await BlockRepository.getAll(bookDb);
      return blocks.map((b) => ({ uuid: b.uuid, title: b.title }));
    },
  },
  getBlockStructure: {
    definition: {
      name: "getBlockStructure",
      description: "Получить структуру блока и его параметры",
      parameters: {
        type: "object",
        properties: { blockUuid: { type: "string" } },
        required: ["blockUuid"],
      },
    },
    handler: async ({ blockUuid }) => {
      const block = await BlockRepository.getByUuid(bookDb, blockUuid);
      if (!block) return null;
      const groups = await BlockParameterRepository.getParameterGroups(bookDb, blockUuid);
      const result = [] as any[];
      for (const g of groups) {
        const params = await BlockParameterRepository.getParamsByGroup(bookDb, g.uuid);
        result.push({ ...g, params });
      }
      return { ...block, parameterGroups: result };
    },
  },
  getInstanceInfo: {
    definition: {
      name: "getInstanceInfo",
      description: "Получить данные экземпляра блока и его параметры",
      parameters: {
        type: "object",
        properties: { instanceUuid: { type: "string" } },
        required: ["instanceUuid"],
      },
    },
    handler: async ({ instanceUuid }) => {
      const inst = await BlockInstanceRepository.getByUuid(bookDb, instanceUuid);
      if (!inst) return null;
      const params = await BlockParameterInstanceRepository.getInstanceParams(bookDb, instanceUuid);
      return { ...inst, params };
    },
  },
  createBlock: {
    definition: {
      name: "createBlock",
      description: "Создать новый блок в книге",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          structureKind: { type: "string" },
        },
        required: ["title", "structureKind"],
      },
    },
    handler: async ({ title, description, structureKind }) => {
      const config = await bookDb.bookConfigurations.toCollection().first();
      const block = {
        title,
        description: description || "",
        configurationUuid: config?.uuid,
        structureKind,
      } as any;
      await BlockRepository.save(bookDb, block, true);
      return block;
    },
  },
  createBlockInstance: {
    definition: {
      name: "createBlockInstance",
      description: "Создать экземпляр блока и вернуть его данные",
      parameters: {
        type: "object",
        properties: {
          blockUuid: { type: "string" },
          title: { type: "string" },
        },
        required: ["blockUuid", "title"],
      },
    },
    handler: async ({ blockUuid, title }) => {
      const instance = {
        uuid: crypto.randomUUID(),
        blockUuid,
        title,
      } as any;
      await BlockInstanceRepository.create(bookDb, instance);
      await BlockParameterInstanceRepository.appendDefaultParams(bookDb, instance);
      return instance;
    },
  },
  saveParamInstance: {
    definition: {
      name: "saveParamInstance",
      description: "Создать или обновить параметр экземпляра блока",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          blockInstanceUuid: { type: "string" },
          blockParameterUuid: { type: "string" },
          blockParameterGroupUuid: { type: "string" },
          value: { type: ["string", "number"] },
        },
        required: ["value"],
      },
    },
    handler: async ({ id, blockInstanceUuid, blockParameterUuid, blockParameterGroupUuid, value }) => {
      if (id) {
        await BlockParameterInstanceRepository.updateParameterInstance(bookDb, Number(id), { value });
        return await bookDb.blockParameterInstances.get(id);
      }
      if (!blockInstanceUuid || !blockParameterUuid || !blockParameterGroupUuid) return null;
      const instance = {
        uuid: crypto.randomUUID(),
        blockInstanceUuid,
        blockParameterUuid,
        blockParameterGroupUuid,
        value,
      } as any;
      await BlockParameterInstanceRepository.addParameterInstance(bookDb, instance);
      return instance;
    },
  },
};

export const bookAgent = async (prompt: string): Promise<string> => {
  const defs = Object.values(tools).map((t) => t.definition);
  // Включаем краткую информацию о структуре bookDb
  let messages: any[] = [
    { role: "system", content: bookDbInfo },
    { role: "user", content: prompt },
  ];

  while (true) {
    const response = await OpenRouterApi.fetchWithTools(
      prompt,
      defs,
      messages
    );
    const message = response.choices?.[0]?.message;
    if (!message) return "";

    const toolCalls = (message as any).tool_calls as any[] | undefined;

    if (toolCalls && toolCalls.length > 0) {
      messages.push(message);

      for (const call of toolCalls) {
        const { name, arguments: args } = call.function as any;
        const tool = tools[name];
        if (!tool) continue;
        let parsed: any = {};
        try {
          parsed = JSON.parse(args || "{}");
        } catch {
          parsed = {};
        }
        const result = await tool.handler(parsed);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify(result),
        });
      }
    } else {
      return message.content ?? "";
    }
  }
};

