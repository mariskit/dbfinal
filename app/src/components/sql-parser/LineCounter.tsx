"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineCounterProps {
  lineCount: number | null;
  calculateLineCount: () => void;
  hasCsvContent: boolean;
}

const LineCounter: React.FC<LineCounterProps> = ({
  lineCount,
  calculateLineCount,
  hasCsvContent,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={calculateLineCount} 
          disabled={!hasCsvContent}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Count Lines in CSV
        </Button>
        {lineCount !== null && (
          <div className="p-4 bg-muted rounded-md text-center">
            <p className="text-lg font-medium text-foreground">
              Number of non-empty lines: <span className="text-primary font-bold">{lineCount}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LineCounter;
