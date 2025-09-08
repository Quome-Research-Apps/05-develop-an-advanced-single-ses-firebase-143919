'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting common reasons for missing medications.
 *
 * It includes the `suggestMissingMedicationReasons` function, the `MissingMedicationReasonsInput` type, and the `MissingMedicationReasonsOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MissingMedicationReasonsInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication the patient missed.'),
  prescribedTime: z.string().describe('The time the medication was prescribed to be taken.'),
  actualIntakeTime: z.string().nullable().describe('The time the medication was actually taken, or null if not taken.'),
});
export type MissingMedicationReasonsInput = z.infer<typeof MissingMedicationReasonsInputSchema>;

const MissingMedicationReasonsOutputSchema = z.object({
  suggestedReasons: z.array(
    z.string().describe('A possible reason why the medication was missed.')
  ).describe('A list of suggested reasons for missing the medication.'),
});
export type MissingMedicationReasonsOutput = z.infer<typeof MissingMedicationReasonsOutputSchema>;

export async function suggestMissingMedicationReasons(input: MissingMedicationReasonsInput): Promise<MissingMedicationReasonsOutput> {
  return suggestMissingMedicationReasonsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMissingMedicationReasonsPrompt',
  input: {schema: MissingMedicationReasonsInputSchema},
  output: {schema: MissingMedicationReasonsOutputSchema},
  prompt: `You are a helpful assistant for healthcare professionals. Given that a patient missed taking their medication, suggest a few common reasons why they might have missed it. Focus on reasons related to forgetting, side effects, or changes in routine.

Medication Name: {{{medicationName}}}
Prescribed Time: {{{prescribedTime}}}
Actual Intake Time: {{{actualIntakeTime}}}

Provide a list of up to 3 possible reasons:
`,
});

const suggestMissingMedicationReasonsFlow = ai.defineFlow(
  {
    name: 'suggestMissingMedicationReasonsFlow',
    inputSchema: MissingMedicationReasonsInputSchema,
    outputSchema: MissingMedicationReasonsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
