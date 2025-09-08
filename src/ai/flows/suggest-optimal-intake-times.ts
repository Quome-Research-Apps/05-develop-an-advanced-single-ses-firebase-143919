// 'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest optimal medication intake times based on user-confirmed reasons for non-adherence.
 *
 * - suggestOptimalIntakeTimes - An async function that takes medication adherence data and reasons for missing medications to suggest better intake times.
 * - SuggestOptimalIntakeTimesInput - The input type for the suggestOptimalIntakeTimes function.
 * - SuggestOptimalIntakeTimesOutput - The return type for the suggestOptimalIntakeTimes function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const SuggestOptimalIntakeTimesInputSchema = z.object({
  medicationSchedule: z.string().describe("A CSV formatted string containing medication schedule data with columns: medication_name, prescribed_time, actual_intake_time."),
  reasonForMissingMedication: z.string().describe("The confirmed reason for missing medications, chosen from: forgot, side effects, change in routine."),
});

export type SuggestOptimalIntakeTimesInput = z.infer<typeof SuggestOptimalIntakeTimesInputSchema>;

const SuggestOptimalIntakeTimesOutputSchema = z.object({
  suggestedIntakeTimes: z.record(z.string(), z.string()).describe("A map of medication names to suggested intake times."),
});

export type SuggestOptimalIntakeTimesOutput = z.infer<typeof SuggestOptimalIntakeTimesOutputSchema>;


export async function suggestOptimalIntakeTimes(input: SuggestOptimalIntakeTimesInput): Promise<SuggestOptimalIntakeTimesOutput> {
  return suggestOptimalIntakeTimesFlow(input);
}


const suggestOptimalIntakeTimesPrompt = ai.definePrompt({
  name: 'suggestOptimalIntakeTimesPrompt',
  input: {
    schema: SuggestOptimalIntakeTimesInputSchema,
  },
  output: {
    schema: SuggestOptimalIntakeTimesOutputSchema,
  },
  prompt: `You are an AI assistant specialized in optimizing medication adherence.

  Based on the patient's medication schedule and the reason they are missing medications, suggest better intake times for each medication.

  Medication Schedule (CSV):
  {{medicationSchedule}}

  Reason for Missing Medication:
  {{reasonForMissingMedication}}

  Consider the following:
  - If the reason is 'forgot', suggest linking medication intake to a daily routine.
  - If the reason is 'side effects', suggest taking the medication with food or at a different time of day.
  - If the reason is 'change in routine', suggest strategies to adapt the medication schedule to the new routine.

  Provide the suggested intake times in a JSON format where the keys are medication names and the values are the suggested intake times.  The intake times must be provided in HH:MM format.
  Ensure the response is a valid JSON.

  Example:
  {
    "Medication A": "08:00",
    "Medication B": "20:00"
  }`,
});

const suggestOptimalIntakeTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalIntakeTimesFlow',
    inputSchema: SuggestOptimalIntakeTimesInputSchema,
    outputSchema: SuggestOptimalIntakeTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalIntakeTimesPrompt(input);
    return output!;
  }
);
