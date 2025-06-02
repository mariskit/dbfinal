"use client";

import { useAppContext } from '@/context/AppContext';
import SqlInput from '@/components/sql-parser/SqlInput';
import CsvInput from '@/components/sql-parser/CsvInput';
import ResultsTable from '@/components/sql-parser/ResultsTable';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { 
    state, 
    dispatch, 
    fetchCsv, 
    executeQuery,
    handleFileUpload 
  } = useAppContext();

  const handleSetSqlCommand = (value: string) => {
    dispatch({ type: 'SET_SQL_COMMAND', payload: value });
  };

  const handleSetCsvUrl = (value: string) => {
    dispatch({ type: 'SET_CSV_URL', payload: value });
  };

  const handleSetCsvContentManual = (value: string) => {
    dispatch({ type: 'SET_CSV_CONTENT_MANUAL', payload: value });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Browser SQL Engine
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Load CSV data and execute SQL queries entirely in your browser
          </p>
        </header>

        <CsvInput
          csvUrl={state.csvUrl}
          setCsvUrl={handleSetCsvUrl}
          csvContent={state.csvContent}
          setCsvContentManual={handleSetCsvContentManual}
          fetchCsv={fetchCsv}
          isLoadingCsv={state.isLoadingCsv}
          handleFileUpload={handleFileUpload}
        />

        <Separator className="my-6" />

        <SqlInput
          sqlCommand={state.sqlCommand}
          setSqlCommand={handleSetSqlCommand}
          executeQuery={executeQuery}
          isExecuting={state.isExecuting}
        />

        {state.error && (
          <div className="p-3 my-2 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/30">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        <Separator className="my-6" />

        <ResultsTable 
          results={state.queryResults} 
          columns={state.queryColumns}
          error={state.error}
        />
      </div>
    </main>
  );
}