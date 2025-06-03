"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import * as Papa from 'papaparse';
import { fetchCsvContent as fetchCsvContentService } from '@/services/csv-service';
import { toast } from "@/hooks/use-toast";

interface AppState {
  sqlCommand: string;
  csvUrl: string;
  csvContent: string;
  isLoadingCsv: boolean;
  isExecuting: boolean;
  error: string | null;
  queryResults: any[];
  queryColumns: string[];
  db: any;
}

const initialState: AppState = {
  sqlCommand: '',
  csvUrl: '',
  csvContent: '',
  isLoadingCsv: false,
  isExecuting: false,
  error: null,
  queryResults: [],
  queryColumns: [],
  db: null,
};

type AppAction =
  | { type: 'SET_SQL_COMMAND'; payload: string }
  | { type: 'SET_CSV_URL'; payload: string }
  | { type: 'FETCH_CSV_START' }
  | { type: 'FETCH_CSV_SUCCESS'; payload: string }
  | { type: 'FETCH_CSV_ERROR'; payload: string }
  | { type: 'SET_CSV_CONTENT_MANUAL'; payload: string }
  | { type: 'EXECUTE_QUERY_START' }
  | { type: 'EXECUTE_QUERY_SUCCESS'; payload: { results: any[]; columns: string[] } }
  | { type: 'EXECUTE_QUERY_ERROR'; payload: string }
  | { type: 'SET_DB'; payload: any }
  | { type: 'CLEAR_ERROR' };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SQL_COMMAND':
      return { ...state, sqlCommand: action.payload };
    case 'SET_CSV_URL':
      return { ...state, csvUrl: action.payload };
    case 'FETCH_CSV_START':
      return { ...state, isLoadingCsv: true, error: null };
    case 'FETCH_CSV_SUCCESS':
      return { ...state, isLoadingCsv: false, csvContent: action.payload, error: null };
    case 'FETCH_CSV_ERROR':
      return { ...state, isLoadingCsv: false, error: action.payload };
    case 'SET_CSV_CONTENT_MANUAL':
      return { ...state, csvContent: action.payload, error: null };
    case 'EXECUTE_QUERY_START':
      return { ...state, isExecuting: true, error: null };
    case 'EXECUTE_QUERY_SUCCESS':
      return {
        ...state,
        isExecuting: false,
        queryResults: action.payload.results,
        queryColumns: action.payload.columns,
        error: null,
      };
    case 'EXECUTE_QUERY_ERROR':
      return {
        ...state,
        isExecuting: false,
        queryResults: [],
        queryColumns: [],
        error: action.payload,
      };
    case 'SET_DB':
      return { ...state, db: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  fetchCsv: () => Promise<void>;
  executeQuery: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    let script: HTMLScriptElement;

    const initDb = async () => {
      try {
        if (!window.SQL) {
          script = document.createElement('script');
          script.src = 'https://sql.js.org/dist/sql-wasm.js';
          script.async = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load SQL.js'));
            document.body.appendChild(script);
          });
        }

        const SQL = await window.initSqlJs({
          locateFile: () => 'https://sql.js.org/dist/sql-wasm.wasm',
        });

        const db = new SQL.Database();
        dispatch({ type: 'SET_DB', payload: db });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize SQL database';
        dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: errorMessage });
      }
    };

    initDb();

    return () => {
      if (script) document.body.removeChild(script);
      if (state.db) state.db.close();
    };
  }, []);

  useEffect(() => {
    if (state.db && state.csvContent) {
      setTimeout(() => loadDataIntoDb(), 0);
    }
  }, [state.csvContent, state.db]);

  const loadDataIntoDb = async () => {
    if (!state.db || !state.csvContent.trim()) return;

    try {
      let stmt: any;
      let columns: string[] = [];
      let tableCreated = false;

      state.db.exec('DROP TABLE IF EXISTS data');

      await new Promise<void>((resolve, reject) => {
        Papa.parse(state.csvContent, {
          header: true,
          skipEmptyLines: true,
          worker: true,
          step: function (row, parser) {
            if (!tableCreated) {
              columns = Object.keys(row.data);
              const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ');
              state.db.exec(`CREATE TABLE data (${columnDefs})`);
              stmt = state.db.prepare(`INSERT INTO data (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`);
              tableCreated = true;
            }

            const values = columns.map(col => row.data[col]);
            stmt.bind(values);
            stmt.step();
            stmt.reset();
          },
          complete: function () {
            if (stmt) stmt.free();
            resolve();
          },
          error: function (error) {
            reject(error);
          },
          chunkSize: 1024 * 32,
        });
      });

      toast({ title: "Success", description: "CSV loaded into database." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CSV data into database';
      dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: errorMessage });
    }
  };

  const fetchCsv = async () => {
    if (!state.csvUrl) {
      toast({ title: "Error", description: "Please enter a CSV URL.", variant: "destructive" });
      dispatch({ type: 'FETCH_CSV_ERROR', payload: 'CSV URL is required.' });
      return;
    }

    dispatch({ type: 'FETCH_CSV_START' });
    try {
      const content = await fetchCsvContentService(state.csvUrl);
      dispatch({ type: 'FETCH_CSV_SUCCESS', payload: content });
      toast({ title: "Success", description: "CSV content fetched successfully." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSV.';
      dispatch({ type: 'FETCH_CSV_ERROR', payload: errorMessage });
      toast({ title: "Error Fetching CSV", description: errorMessage, variant: "destructive" });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsText(file);
      });
      dispatch({ type: 'SET_CSV_CONTENT_MANUAL', payload: content });
      toast({ title: "Success", description: "CSV file uploaded successfully." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file.';
      dispatch({ type: 'FETCH_CSV_ERROR', payload: errorMessage });
      toast({ title: "Error Uploading File", description: errorMessage, variant: "destructive" });
    }
  };

  const executeQuery = async () => {
    if (!state.db) {
      dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: 'Database not initialized' });
      return;
    }

    if (!state.sqlCommand.trim()) {
      dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: 'SQL query is required' });
      return;
    }

    dispatch({ type: 'EXECUTE_QUERY_START' });

    setTimeout(() => {
      try {
        const results = state.db.exec(state.sqlCommand);

        if (results.length === 0) {
          dispatch({ type: 'EXECUTE_QUERY_SUCCESS', payload: { results: [], columns: [] } });
          return;
        }

        dispatch({
          type: 'EXECUTE_QUERY_SUCCESS',
          payload: {
            results: results[0].values || [],
            columns: results[0].columns,
          },
        });
      } catch (err) {
        let errorMessage = 'Failed to execute query';
        if (err instanceof Error) {
          errorMessage = err.message;
          const lines = state.sqlCommand.split('\n');
          const keywordMatch = err.message.match(/near \"?([A-Za-z0-9_]+)\"?/);
          if (keywordMatch && keywordMatch[1]) {
            const keyword = keywordMatch[1].toLowerCase();
            const lineWithError = lines.findIndex(line => line.toLowerCase().includes(keyword));
            if (lineWithError !== -1) {
              errorMessage += ` (possible error at line ${lineWithError + 1}: \"${lines[lineWithError].trim()}\")`;
            }
          }
        }
        dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: errorMessage });
      }
    }, 0);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        fetchCsv,
        executeQuery,
        handleFileUpload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
