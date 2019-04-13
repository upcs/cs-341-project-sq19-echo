export interface ISelectSqlQuery {
  readonly whatToSelect: string;
  readonly tableToSelectFrom: string;
  readonly whereStatements: string[];
}
