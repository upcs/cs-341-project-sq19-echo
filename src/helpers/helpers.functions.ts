import {ISelectSqlQuery} from './helpers.interfaces';

export function getSqlSelectCommand(sqlQuery: ISelectSqlQuery): string {
  return `SELECT ${sqlQuery.whatToSelect} FROM ${sqlQuery.tableToSelectFrom} WHERE ${sqlQuery.whereStatements.join(' AND ')}`;
}

export function displayGeneralErrorMessage(): void {
  alert('Cannot get information. Check that you are connected to the Internet.');
}
