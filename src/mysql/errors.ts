export class MysqlConnectionError extends Error {
  constructor(payload: any) {
    super(payload);
  }
}