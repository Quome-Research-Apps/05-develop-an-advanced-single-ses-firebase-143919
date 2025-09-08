export type MedicationIntake = {
  id: number;
  medication_name: string;
  prescribed_time: string; // "HH:mm"
  actual_intake_time: string | null; // "HH:mm" or null
};

// This is an alias from the AI flow, re-exported here for convenience if needed, but direct import is also fine.
export type { AnalyzeAdherenceTimingPatternsInput } from '@/ai/flows/analyze-adherence-timing-patterns';
