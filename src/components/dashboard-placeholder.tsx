"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { MedicationIntake } from "@/lib/types";

function parseCSV(csvText: string): MedicationIntake[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const medicationNameIndex = headers.indexOf('medication_name');
  const prescribedTimeIndex = headers.indexOf('prescribed_time');
  const actualIntakeTimeIndex = headers.indexOf('actual_intake_time');

  if (medicationNameIndex === -1 || prescribedTimeIndex === -1 || actualIntakeTimeIndex === -1) {
    throw new Error("CSV must include 'medication_name', 'prescribed_time', and 'actual_intake_time' columns.");
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const actual_intake_time = values[actualIntakeTimeIndex]?.trim();
    return {
      id: index,
      medication_name: values[medicationNameIndex]?.trim() || 'Unknown',
      prescribed_time: values[prescribedTimeIndex]?.trim() || '00:00',
      actual_intake_time: actual_intake_time && actual_intake_time !== '' ? actual_intake_time : null,
    };
  }).filter(item => item.medication_name && item.prescribed_time);
}

type DashboardPlaceholderProps = {
  onDataImported: (data: MedicationIntake[]) => void;
};

export default function DashboardPlaceholder({ onDataImported }: DashboardPlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedData = parseCSV(text);
          if (parsedData.length === 0) {
            throw new Error("CSV file is empty or does not contain valid data rows.");
          }
          onDataImported(parsedData);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error importing file",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
          });
        }
      };
      reader.onerror = () => {
         toast({
            variant: "destructive",
            title: "Error reading file",
            description: "Could not read the selected file.",
          });
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center pt-16">
      <Card className="w-full max-w-xl text-center shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Welcome to DoseWise Visualizer</CardTitle>
          <CardDescription className="text-base">
            Analyze patient medication adherence with powerful, interactive visualizations.
            All data is processed in your browser and is gone when you leave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 p-4 border-t">
            <p className="text-muted-foreground">
              To begin, import a patient's schedule. The file must be a CSV with columns:
              <br />
              <code className="font-code bg-muted px-1 py-0.5 rounded-sm mx-1">medication_name</code>,
              <code className="font-code bg-muted px-1 py-0.5 rounded-sm mx-1">prescribed_time</code>, and
              <code className="font-code bg-muted px-1 py-0.5 rounded-sm mx-1">actual_intake_time</code>.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <Button onClick={handleImportClick} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Upload className="mr-2 h-5 w-5" />
              Import Schedule CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
