"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { analyzeAdherenceTimingPatterns } from "@/ai/flows/analyze-adherence-timing-patterns";
import type { MedicationIntake, AnalyzeAdherenceTimingPatternsInput } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

type HeatmapData = {
  dataUri: string;
  insights: string;
};

export default function TimeOfDayHeatmap({ data }: { data: MedicationIntake[] }) {
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    async function generateHeatmap() {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      setHeatmap(null);
      try {
        const input: AnalyzeAdherenceTimingPatternsInput = data
          .filter(d => d.actual_intake_time)
          .map(d => ({
            medication_name: d.medication_name,
            prescribed_time: d.prescribed_time,
            actual_intake_time: d.actual_intake_time!,
          }));

        if (input.length < 1) {
            setError("Not enough data to generate a heatmap. At least one dose must have an actual intake time.");
            setLoading(false);
            return;
        }

        const result = await analyzeAdherenceTimingPatterns(input);
        if (isMounted) {
            setHeatmap({
              dataUri: result.heatmapDataUri,
              insights: result.insights
            });
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "An unexpected error occurred while generating the heatmap.");
          console.error(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    generateHeatmap();

    return () => {
      isMounted = false;
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Heatmap Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (!heatmap) {
    return (
       <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Heatmap Data</AlertTitle>
          <AlertDescription>Could not generate heatmap data from the provided schedule.</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full bg-muted/50 rounded-lg flex items-center justify-center">
         {heatmap.dataUri ? (
            <Image src={heatmap.dataUri} alt="Adherence Heatmap" fill className="object-contain rounded-md" />
         ) : (
            <p className="text-muted-foreground">AI did not return an image.</p>
         )}
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-primary">AI Insights</h4>
        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{heatmap.insights || "No insights were generated."}</p>
      </div>
    </div>
  );
}
