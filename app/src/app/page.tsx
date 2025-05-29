"use client";

import { useAppContext } from '@/context/AppContext';
import SqlInput from '@/components/sql-parser/SqlInput';
import CsvInput from '@/components/sql-parser/CsvInput';
import LineCounter from '@/components/sql-parser/LineCounter';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { state, dispatch, fetchCsv } = useAppContext();

  const handleSetSqlCommand = (value: string) => {
    dispatch({ type: 'SET_SQL_COMMAND', payload: value });
  };

  const handleSetCsvUrl = (value: string) => {
    dispatch({ type: 'SET_CSV_URL', payload: value });
  };

  const handleSetCsvContentManual = (value: string) => {
    dispatch({ type: 'SET_CSV_CONTENT_MANUAL', payload: value });
  };

  const handleCalculateLineCount = () => {
    dispatch({ type: 'CALCULATE_LINE_COUNT' });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            SQL Parser
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Input your SQL, fetch or paste CSV data, and analyze its content.
          </p>
        </header>

        <SqlInput
          sqlCommand={state.sqlCommand}
          setSqlCommand={handleSetSqlCommand}
        />

        <Separator className="my-6" />

        <CsvInput
          csvUrl={state.csvUrl}
          setCsvUrl={handleSetCsvUrl}
          csvContent={state.csvContent}
          setCsvContentManual={handleSetCsvContentManual}
          fetchCsv={fetchCsv}
          isLoadingCsv={state.isLoadingCsv}
        />
        
        {state.error && (
          <div className="p-3 my-2 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/30">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        <Separator className="my-6" />

        <LineCounter
          lineCount={state.lineCount}
          calculateLineCount={handleCalculateLineCount}
          hasCsvContent={!!state.csvContent.trim()}
        />
      </div>
    </main>
  );
}
