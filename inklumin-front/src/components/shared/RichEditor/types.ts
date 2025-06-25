export enum IWarningKind {
  CLICHE = "CLICHE",
  REPEAT = "REPEAT",
  SPELLING = "SPELLING",
}

export enum IWarningKindTile {
  CLICHE = "Штампы",
  REPEAT = "Повторы",
  SPELLING = "Орфография",
}
export interface IWarning {
  id: string;
  from: number;
  to: number;
  text: string;
  kind: string;
  groupIndex: string;
  active: boolean;
  suggestions: string[]
}
export interface IClicheWarning extends IWarning {
  pattern: string;
}

export interface IRepeatWarning extends IWarning {}

export interface ISpellingWarning extends IWarning {
  suggestions: string[];
}

export interface IWarningGroup {
  groupIndex: string;
  warningKind: IWarningKind;
  warnings: IWarning[];
}
export interface IWarningContainer {
  warningKind: IWarningKind;
  warningGroups: IWarningGroup[];
}
