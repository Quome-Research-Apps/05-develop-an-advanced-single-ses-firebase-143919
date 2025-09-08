"use client";

import { useState, useMemo } from 'react';
import type { MedicationIntake } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { suggestMissingMedicationReasons } from '@/ai/flows/suggest-missing-medication-reasons';
import { suggestOptimalIntakeTimes } from '@/ai/flows/suggest-optimal-intake-times';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb, Loader2, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function RemediationAdvisor({ data }: { data: MedicationIntake[] }) {
  const [selectedDose, setSelectedDose] = useState<MedicationIntake | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Record<string, string> | null>(null);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const missedDoses = useMemo(() => data.filter(d => d.actual_intake_time === null), [data]);

  const handleGetReasons = async (dose: MedicationIntake) => {
    setSelectedDose(dose);
    setSuggestions(null);
    setSelectedReason('');
    setReasons([]);
    setLoadingReasons(true);
    setError(null);
    try {
      const result = await suggestMissingMedicationReasons({
        medicationName: dose.medication_name,
        prescribedTime: dose.prescribed_time,
        actualIntakeTime: null,
      });
      setReasons(result.suggestedReasons);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to suggest reasons.");
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!selectedReason) {
      setError("Please select a reason.");
      return;
    }
    setLoadingSuggestions(true);
    setError(null);
    try {
      const scheduleCSV = "medication_name,prescribed_time,actual_intake_time\n" + data.map(d => `${d.medication_name},${d.prescribed_time},${d.actual_intake_time || ''}`).join('\n');
      
      const result = await suggestOptimalIntakeTimes({
        medicationSchedule: scheduleCSV,
        reasonForMissingMedication: selectedReason,
      });
      setSuggestions(result.suggestedIntakeTimes);
    } catch (e) {
       setError(e instanceof Error ? e.message : "Failed to get suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (missedDoses.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent"/>Automated Remediation Advisor</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No missed doses in this schedule. Great adherence!</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent"/>Automated Remediation Advisor</CardTitle>
        <CardDescription>Get AI-powered advice for missed doses to improve future adherence.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Step 1: Select a Missed Dose</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-lg p-2">
            {missedDoses.map(dose => (
              <div key={dose.id} className={`p-3 border rounded-lg flex justify-between items-center transition-all cursor-pointer hover:bg-muted ${selectedDose?.id === dose.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`} onClick={() => handleGetReasons(dose)}>
                <div>
                  <p className="font-semibold">{dose.medication_name}</p>
                  <p className="text-sm text-muted-foreground">Prescribed: {dose.prescribed_time}</p>
                </div>
                {loadingReasons && selectedDose?.id === dose.id && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {selectedDose && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Step 2: Why was this dose missed?</h4>
              {loadingReasons && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Fetching possible reasons...</div>}
              {reasons.length > 0 && (
                <>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-2">
                  {reasons.map((reason, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={`reason-${index}`} />
                      <Label htmlFor={`reason-${index}`}>{reason}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={handleGetSuggestions} disabled={!selectedReason || loadingSuggestions}>
                    {loadingSuggestions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Suggest New Times
                </Button>
                </>
              )}
            </div>
          )}
          
          {loadingSuggestions && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Generating suggestions...</div>}
          
          {suggestions && (
            <div className='space-y-4'>
              <h4 className="font-semibold text-lg">Step 3: AI-Powered Schedule Suggestions</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Suggested Intake Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(suggestions).map(([med, time]) => (
                    <TableRow key={med}>
                      <TableCell className="font-medium">{med}</TableCell>
                      <TableCell className="font-bold text-primary">{time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
