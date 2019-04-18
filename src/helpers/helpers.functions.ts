import {ISelectSqlQuery} from './helpers.interfaces';

export function getSqlSelectCommand(sqlQuery: ISelectSqlQuery): string {
  let selectCommand = `SELECT ${sqlQuery.whatToSelect} FROM ${sqlQuery.tableToSelectFrom}`;
  if (sqlQuery.whereStatements.length) {
    selectCommand += ` WHERE ${sqlQuery.whereStatements.join(' AND ')}`;
  }
  return `${selectCommand};`;
}

export function displayGeneralErrorMessage(): void {
  alert('Cannot get information. Check that you are connected to the Internet.');
}
