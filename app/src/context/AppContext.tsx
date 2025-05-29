"use client";

import type React from 'react';
import { createContext, useReducer, useContext, type Dispatch } from 'react';
import { fetchCsvContent as fetchCsvContentService } from '@/services/csv-service';
import { toast } from "@/hooks/use-toast";

// State
interface AppState {
  sqlCommand: string;
  csvUrl: string;
  csvContent: string;
  lineCount: number | null;
  isLoadingCsv: boolean;
  error: string | null;
}

const initialState: AppState = {
  sqlCommand: '',
  csvUrl: '',
  csvContent: '',
  lineCount: null,
  isLoadingCsv: false,
  error: null,
};

// Actions
type AppAction =
  | { type: 'SET_SQL_COMMAND'; payload: string }
  | { type: 'SET_CSV_URL'; payload: string }
  | { type: 'FETCH_CSV_START' }
  | { type: 'FETCH_CSV_SUCCESS'; payload: string }
  | { type: 'FETCH_CSV_ERROR'; payload: string }
  | { type: 'SET_CSV_CONTENT_MANUAL'; payload: string }
  | { type: 'CALCULATE_LINE_COUNT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SQL_COMMAND':
      return { ...state, sqlCommand: action.payload };
    case 'SET_CSV_URL':
      return { ...state, csvUrl: action.payload };
    case 'FETCH_CSV_START':
      return { ...state, isLoadingCsv: true, error: null, lineCount: null };
    case 'FETCH_CSV_SUCCESS':
      return { ...state, isLoadingCsv: false, csvContent: action.payload, error: null, lineCount: null };
    case 'FETCH_CSV_ERROR':
      return { ...state, isLoadingCsv: false, error: action.payload };
    case 'SET_CSV_CONTENT_MANUAL':
      return { ...state, csvContent: action.payload, lineCount: null, error: null };
    case 'CALCULATE_LINE_COUNT': {
      if (!state.csvContent.trim()) {
        return { ...state, lineCount: 0, error: null };
      }
      const lines = state.csvContent.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim() !== '').length;
      return { ...state, lineCount: nonEmptyLines, error: null };
    }
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
interface AppContextProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  fetchCsv: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

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
  
  return (
    <AppContext.Provider value={{ state, dispatch, fetchCsv }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
