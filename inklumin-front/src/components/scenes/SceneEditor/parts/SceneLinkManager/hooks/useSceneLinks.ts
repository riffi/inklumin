import { useLiveQuery } from "dexie-react-hooks";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance, IBlockInstanceSceneLink } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockInstanceSceneLinkRepository } from "@/repository/BlockInstance/BlockInstanceSceneLinkRepository";

export const useSceneLinks = (sceneId: number) => {
  const blocks = useLiveQuery<IBlock[]>(async () => {
    const all = await BlockRepository.getAll(bookDb);
    return all.filter((b) => b.sceneLinkAllowed === 1);
  }, [sceneId]);

  const links = useLiveQuery<IBlockInstanceSceneLink[]>(
    () => BlockInstanceSceneLinkRepository.getLinksBySceneId(bookDb, sceneId),
    [sceneId]
  );

  const blockInstances = useLiveQuery<IBlockInstance[]>(
    () => BlockInstanceRepository.getAll(bookDb),
    [sceneId]
  );

  return { blocks, links, blockInstances };
};
