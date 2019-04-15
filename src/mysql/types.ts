export namespace MysqlTypes {
  export type Row = any;
  export type ExecutionResult = {
    insertId?: number;
  };

  export interface MysqlTransaction {
    query: (sql: string, params?: any[]) => Promise<Row[] | ExecutionResult>;
    rollback: () => Promise<void>;
  }

  export type MysqlTransactionExecutor = (tx: MysqlTransaction) => Promise<any>;

  export interface MysqlDriver {
    query: (sql: string, params?: any[]) => Promise<Row[] | ExecutionResult>;
    transaction: (executor: MysqlTransactionExecutor) => Promise<any>;
  }
}