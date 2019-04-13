export interface IDensityInfo {
  readonly min: number;
  readonly max: number;
}

export interface ISelectSqlQuery {
  readonly whatToSelect: string;
  readonly tableToSelectFrom: string;
  readonly whereStatements: string[];
}
