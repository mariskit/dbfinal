"use client";

import type React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CsvInputProps {
  csvUrl: string;
  setCsvUrl: (value: string) => void;
  csvContent: string;
  setCsvContentManual: (value: string) => void;
  fetchCsv: () => void;
  isLoadingCsv: boolean;
}

const CsvInput: React.FC<CsvInputProps> = ({
  csvUrl,
  setCsvUrl,
  csvContent,
  setCsvContentManual,
  fetchCsv,
  isLoadingCsv,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">CSV Data</CardTitle>
        <CardDescription>Enter a CSV URL to fetch data, or paste CSV content directly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-url" className="font-medium">CSV File URL</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="csv-url"
              type="url"
              placeholder="https://example.com/data.csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              className="text-sm border-input focus:ring-ring focus:border-ring"
              disabled={isLoadingCsv}
            />
            <Button onClick={fetchCsv} disabled={isLoadingCsv || !csvUrl} variant="secondary">
              {isLoadingCsv ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch CSV"
              )}
            </Button>
          </div>
        </div>
        
        <div className="relative">
           <div className="absolute inset-0 flex items-center">
             <span className="w-full border-t" />
           </div>
           <div className="relative flex justify-center text-xs uppercase">
             <span className="bg-card px-2 text-muted-foreground">
               Or
             </span>
           </div>
         </div>

        <div className="space-y-2">
          <Label htmlFor="csv-content" className="font-medium">Manual CSV Input / Fetched Content</Label>
          <Textarea
            id="csv-content"
            placeholder="Paste your CSV content here, or see fetched data..."
            value={csvContent}
            onChange={(e) => setCsvContentManual(e.target.value)}
            rows={8}
            className="text-sm border-input focus:ring-ring focus:border-ring"
            disabled={isLoadingCsv}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvInput;
