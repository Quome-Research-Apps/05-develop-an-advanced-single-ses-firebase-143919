"use client";

import type { MedicationIntake } from "@/lib/types";
import { useMemo } from "react";
import { differenceInMinutes } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AdherenceTimelineChart from "./adherence-timeline-chart";
import TimeOfDayHeatmap from "./time-of-day-heatmap";
import RemediationAdvisor from "./remediation-advisor";

type DashboardProps = {
  data: MedicationIntake[];
};

function timeToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function calculateCompliance(data: MedicationIntake[], toleranceMinutes: number = 30): number {
  if (!data || data.length === 0) return 0;

  const onTimeDoses = data.filter(item => {
    if (!item.actual_intake_time) return false;
    try {
      const prescribed = timeToDate(item.prescribed_time);
      const actual = timeToDate(item.actual_intake_time);
      const diff = Math.abs(differenceInMinutes(actual, prescribed));
      return diff <= toleranceMinutes;
    } catch(e) {
      return false;
    }
  }).length;
  
  const totalPrescribed = data.length;
  if(totalPrescribed === 0) return 0;

  return Math.round((onTimeDoses / totalPrescribed) * 100);
}

export default function Dashboard({ data }: DashboardProps) {
  const complianceScore = useMemo(() => calculateCompliance(data), [data]);
  const missedDoses = useMemo(() => data.filter(d => d.actual_intake_time === null), [data]);

  return (
    <div className="grid gap-6 auto-rows-max lg:grid-cols-3">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
            <div className="text-center p-4">
              <p className="text-5xl font-bold text-primary">{complianceScore}%</p>
              <p className="text-sm text-muted-foreground">Overall Compliance</p>
            </div>
            <div className="text-center p-4">
              <p className="text-5xl font-bold text-destructive">{missedDoses.length}</p>
              <p className="text-sm text-muted-foreground">Missed Doses</p>
            </div>
             <div className="text-center p-4">
              <p className="text-5xl font-bold">{data.length}</p>
              <p className="text-sm text-muted-foreground">Total Doses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Adherence Timeline</CardTitle>
             <CardDescription>
              This chart shows the prescribed time vs. the actual time medication was taken for each dose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdherenceTimelineChart data={data} />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Adherence Heatmap</CardTitle>
             <CardDescription>
              An AI-generated heatmap showing adherence patterns by time of day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOfDayHeatmap data={data} />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-3">
          <RemediationAdvisor data={data} />
      </div>
    </div>
  );
}
