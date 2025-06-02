// src/lib/sql-utils.ts
import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import { useEffect, useState } from 'react';

export interface QueryResult {
  columns: string[];
  values: any[][];
}

export const useSqlJs = () => {
  const [SQL, setSQL] = useState<typeof initSqlJs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSqlJs = async () => {
      try {
        // Load sql-wasm.wasm from public directory
        const sqlWasm = await fetch('/sql-wasm.wasm');
        const sqlWasmBinary = await sqlWasm.arrayBuffer();
        
        const SQL = await initSqlJs({
          locateFile: () => '/sql-wasm.wasm',
          wasmBinary: sqlWasmBinary
        });
        setSQL(() => SQL);
      } catch (err) {
        setError('Failed to load SQL.js');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSqlJs();
  }, []);

  return { SQL, loading, error };
};

export const createDatabase = (SQL: typeof initSqlJs) => {
  return new SQL.Database();
};

export const executeQuery = (db: Database, query: string): QueryResult => {
  try {
    const result = db.exec(query);
    if (result.length === 0) {
      return { columns: [], values: [] };
    }
    return {
      columns: result[0].columns,
      values: result[0].values,
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Invalid SQL query');
  }
};

export const importCsvToDb = (db: Database, csvData: string, tableName = 'data') => {
  try {
    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) throw new Error('CSV is empty');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
    
    // Create table
    const createTableSql = `CREATE TABLE ${tableName} (${headers.map(h => `${h} TEXT`).join(', ')});`;
    db.run(createTableSql);
    
    // Insert data
    const insertSql = `INSERT INTO ${tableName} VALUES (${headers.map(() => '?').join(', ')});`;
    const stmt = db.prepare(insertSql);
    
    rows.forEach(row => {
      stmt.run(row);
    });
    
    stmt.free();
    return true;
  } catch (err: any) {
    throw new Error(`Failed to import CSV: ${err.message}`);
  }
};