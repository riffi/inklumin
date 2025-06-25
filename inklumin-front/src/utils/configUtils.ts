import { IBlock, IBlockStructureKind } from "@/entities/ConstructorEntities";

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str[0].toLocaleUpperCase() + str.slice(1);
}

export const getBlockTitle = (block: IBlock | undefined) => {
  if (!block) {
    return "";
  }

  if (block.structureKind === IBlockStructureKind.multiple) {
    return capitalizeFirstLetter(block.titleForms?.plural) || block?.title || "";
  }

  return block?.title || "";
};
