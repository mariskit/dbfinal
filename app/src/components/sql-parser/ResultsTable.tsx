"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ResultsTableProps {
  results: any[];
  columns: string[];
  error?: string | null;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, columns, error }) => {
  if (error) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Query Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/30">
            <strong>Error:</strong> {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (columns.length === 0 || results.length === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Query Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {columns.length === 0 && results.length === 0
              ? "No results to display. Execute a query to see results."
              : "Query executed successfully but returned no results."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Query Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-auto max-h-[500px] border rounded-md">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className="p-2 text-left font-medium border-b"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  {row.map((cell: any, cellIndex: number) => (
                    <td 
                      key={cellIndex} 
                      className="p-2 border-b"
                    >
                      {cell?.toString() ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {results.length} row{results.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;