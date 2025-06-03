"use client";

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

interface CsvInputProps {
  csvUrl: string;
  setCsvUrl: (value: string) => void;
  csvContent: string;
  setCsvContentManual: (value: string) => void;
  fetchCsv: () => void;
  isLoadingCsv: boolean;
  handleFileUpload: (file: File) => Promise<void>;
}

const CsvInput: React.FC<CsvInputProps> = ({
  csvUrl,
  setCsvUrl,
  csvContent,
  setCsvContentManual,
  fetchCsv,
  isLoadingCsv,
  handleFileUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">CSV Data Input</CardTitle>
        <CardDescription>Load CSV data from URL, file upload, or paste directly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CSV URL input */}
        <div className="space-y-2">
          <Label htmlFor="csv-url" className="font-medium">CSV URL</Label>
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
            <Button 
              onClick={fetchCsv} 
              disabled={isLoadingCsv || !csvUrl} 
              variant="secondary"
            >
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Upload with drag and drop */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="font-medium">Upload CSV File</Label>
          <label
            htmlFor="file-upload"
            className={`flex flex-1 items-center justify-center rounded-md border-2 border-dashed px-4 py-6 cursor-pointer transition-all
              ${isDragging ? 'border-blue-500 bg-blue-50 text-blue-500' : 'border-input hover:bg-accent hover:text-accent-foreground'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span>Click to upload or drag and drop</span>
              <span className="text-xs">CSV files only</span>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="sr-only"
              disabled={isLoadingCsv}
            />
          </label>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Paste content manually */}
        <div className="space-y-2">
          <Label htmlFor="csv-content" className="font-medium">Paste CSV Content</Label>
          <Textarea
            id="csv-content"
            placeholder="Paste your CSV content here..."
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
