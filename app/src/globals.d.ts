declare module 'sql.js' {
  export interface Database {
    exec(sql: string): { columns: string[]; values: any[][] }[];
    prepare(sql: string): Statement;
    close(): void;
    run(sql: string, params?: any[]): void;
  }

  export interface Statement {
    bind(values: any[]): void;
    step(): boolean;
    get(): any[];
    getAsObject(): { [columnName: string]: any };
    reset(): void;
    free(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: Buffer | Uint8Array) => Database;
  }
}

declare global {
  interface Window {
    initSqlJs: (config?: any) => Promise<SqlJsStatic>;
    SQL: SqlJsStatic;
  }
}