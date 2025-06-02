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
        error: null 
      };
    case 'EXECUTE_QUERY_ERROR':
      return { 
        ...state, 
        isExecuting: false, 
        queryResults: [], 
        queryColumns: [],
        error: action.payload 
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
        // Cargar SQL.js dinámicamente
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
          locateFile: () => 'https://sql.js.org/dist/sql-wasm.wasm'
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
      loadDataIntoDb();
    }
  }, [state.csvContent, state.db]);

const loadDataIntoDb = async () => {
  if (!state.db || !state.csvContent.trim()) return;

  try {
    const results = Papa.parse(state.csvContent, {
      header: true,
      skipEmptyLines: true
    });

    if (results.errors.length > 0) {
      throw new Error(results.errors[0].message);
    }

    if (results.data.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    const columns = Object.keys(results.data[0] as Record<string, string>);
    const escapedColumns = columns.map(col => `\`${col}\``); // Escapar con backticks

    const columnDefs = escapedColumns.map(col => `${col} TEXT`).join(', ');

    state.db.exec('DROP TABLE IF EXISTS data');
    state.db.exec(`CREATE TABLE data (${columnDefs})`);

    const stmt = state.db.prepare(`INSERT INTO data VALUES (${columns.map(() => '?').join(', ')})`);

    for (const row of results.data as Record<string, string>[]) {
      const values = columns.map(col => row[col]);
      stmt.bind(values);
      stmt.step();
      stmt.reset();
    }

    stmt.free();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load CSV data into database';
    dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: errorMessage });
  }
};


  const fetchCsv = async () => {
    if (!state.csvUrl) {
      toast({
        title: "Error",
        description: "Please enter a CSV URL.",
        variant: "destructive",
      });
      dispatch({ type: 'FETCH_CSV_ERROR', payload: 'CSV URL is required.' });
      return;
    }
    
    dispatch({ type: 'FETCH_CSV_START' });
    try {
      const content = await fetchCsvContentService(state.csvUrl);
      dispatch({ type: 'FETCH_CSV_SUCCESS', payload: content });
      toast({
        title: "Success",
        description: "CSV content fetched successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSV.';
      dispatch({ type: 'FETCH_CSV_ERROR', payload: errorMessage });
      toast({
        title: "Error Fetching CSV",
        description: errorMessage,
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "CSV file uploaded successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file.';
      dispatch({ type: 'FETCH_CSV_ERROR', payload: errorMessage });
      toast({
        title: "Error Uploading File",
        description: errorMessage,
        variant: "destructive",
      });
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

    try {
      const results = state.db.exec(state.sqlCommand);
      
      if (results.length === 0) {
        dispatch({ 
          type: 'EXECUTE_QUERY_SUCCESS', 
          payload: { results: [], columns: [] } 
        });
        return;
      }

      const columns = results[0].columns;
      const values = results[0].values;

      dispatch({ 
        type: 'EXECUTE_QUERY_SUCCESS', 
        payload: { 
          results: values || [], 
          columns 
        } 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute query';
      dispatch({ type: 'EXECUTE_QUERY_ERROR', payload: errorMessage });
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      fetchCsv, 
      executeQuery,
      handleFileUpload 
    }}>
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