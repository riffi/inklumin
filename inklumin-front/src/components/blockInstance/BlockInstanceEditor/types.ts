import { IBlockParameterInstance } from "@/entities/BookEntities";
import { IBlockParameter } from "@/entities/ConstructorEntities";

export type FullParam = {
  parameter?: IBlockParameter;
  instance: IBlockParameterInstance;
};
