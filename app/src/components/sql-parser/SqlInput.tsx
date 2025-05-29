"use client";

import type React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SqlInputProps {
  sqlCommand: string;
  setSqlCommand: (value: string) => void;
}

const SqlInput: React.FC<SqlInputProps> = ({ sqlCommand, setSqlCommand }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">SQL Command</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-2">
          <Label htmlFor="sql-command" className="sr-only">SQL Command</Label>
          <Textarea
            id="sql-command"
            placeholder="Enter your SQL command here..."
            value={sqlCommand}
            onChange={(e) => setSqlCommand(e.target.value)}
            rows={6}
            className="text-sm border-input focus:ring-ring focus:border-ring"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SqlInput;
