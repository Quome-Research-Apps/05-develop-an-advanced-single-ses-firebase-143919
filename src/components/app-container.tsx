"use client";

import { useState } from "react";
import type { MedicationIntake } from "@/lib/types";
import DashboardPlaceholder from "@/components/dashboard-placeholder";
import Dashboard from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Pill } from "lucide-react";

export default function AppContainer() {
  const [data, setData] = useState<MedicationIntake[] | null>(null);

  const handleDataImported = (importedData: MedicationIntake[]) => {
    setData(importedData);
  };
  
  const handleReset = () => {
    setData(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">
              DoseWise Visualizer
            </h1>
          </div>
          {data && (
            <Button onClick={handleReset} variant="outline">
              Reset & Import New
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          {!data ? (
            <DashboardPlaceholder onDataImported={handleDataImported} />
          ) : (
            <Dashboard data={data} />
          )}
        </div>
      </main>
    </>
  );
}
