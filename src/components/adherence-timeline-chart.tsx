"use client";

import type { MedicationIntake } from "@/lib/types";
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, DotProps, Dot } from 'recharts';

function timeStringToMinutes(timeString: string | null): number | null {
  if (!timeString) return null;
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  } catch {
    return null;
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground border p-3 rounded-lg shadow-lg">
        <p className="font-bold">{data.medication_name}</p>
        <p className="text-sm">{`Dose #${label + 1}`}</p>
        <p className="text-sm text-primary">{`Prescribed: ${data.prescribed_time}`}</p>
        <p className="text-sm text-accent">{`Actual: ${data.actual_intake_time || 'Missed'}`}</p>
      </div>
    );
  }

  return null;
};

export default function AdherenceTimelineChart({ data }: { data: MedicationIntake[] }) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      index: index + 1,
      prescribed_minutes: timeStringToMinutes(item.prescribed_time),
      actual_minutes: timeStringToMinutes(item.actual_intake_time),
    }));
  }, [data]);
  
  const yAxisTicks = [0, 240, 480, 720, 960, 1200, 1440]; // Every 4 hours
  const formatYAxis = (tickItem: number) => {
    const hours = Math.floor(tickItem / 60).toString().padStart(2, '0');
    const minutes = (tickItem % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" label={{ value: 'Dose Sequence', position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis
            domain={[0, 1440]}
            ticks={yAxisTicks}
            tickFormatter={formatYAxis}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: 'Time of Day', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{paddingTop: "20px"}}/>
          <Line
            type="monotone"
            dataKey="prescribed_minutes"
            name="Prescribed Time"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="actual_minutes"
            name="Actual Intake"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            connectNulls={false}
            dot={{ r: 4, fill: "hsl(var(--accent))" }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
