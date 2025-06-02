"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SqlInputProps {
  sqlCommand: string;
  setSqlCommand: (value: string) => void;
  executeQuery: () => void;
  isExecuting: boolean;
}

const SqlInput: React.FC<SqlInputProps> = ({ 
  sqlCommand, 
  setSqlCommand, 
  executeQuery,
  isExecuting
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">SQL Query</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full gap-2">
          <Label htmlFor="sql-command" className="sr-only">SQL Command</Label>
          <Textarea
            id="sql-command"
            placeholder="Enter your SQL query here (e.g., SELECT * FROM data)..."
            value={sqlCommand}
            onChange={(e) => setSqlCommand(e.target.value)}
            rows={6}
            className="text-sm border-input focus:ring-ring focus:border-ring font-mono"
          />
        </div>
        <Button 
          onClick={executeQuery} 
          disabled={isExecuting || !sqlCommand.trim()}
          className="w-full"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            "Execute Query"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SqlInput;