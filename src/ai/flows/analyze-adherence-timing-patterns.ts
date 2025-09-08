'use server';
/**
 * @fileOverview Analyzes medication adherence timing patterns to generate a time-of-day heatmap.
 *
 * - analyzeAdherenceTimingPatterns - A function that processes medication intake data and returns a heatmap visualization.
 * - AnalyzeAdherenceTimingPatternsInput - The input type for the analyzeAdherenceTimingPatterns function.
 * - AnalyzeAdherenceTimingPatternsOutput - The return type for the analyzeAdherenceTimingPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAdherenceTimingPatternsInputSchema = z.array(
  z.object({
    medication_name: z.string().describe('Name of the medication'),
    prescribed_time: z.string().describe('Prescribed time for the medication intake (e.g., HH:mm)'),
    actual_intake_time: z.string().describe('Actual intake time of the medication (e.g., HH:mm)'),
  })
).describe('Array of medication intake records.');

export type AnalyzeAdherenceTimingPatternsInput = z.infer<typeof AnalyzeAdherenceTimingPatternsInputSchema>;

const AnalyzeAdherenceTimingPatternsOutputSchema = z.object({
  heatmapDataUri: z.string().describe('A data URI containing the heatmap visualization as a PNG image.'),
  insights: z.string().describe('Key insights derived from the adherence heatmap analysis.'),
});

export type AnalyzeAdherenceTimingPatternsOutput = z.infer<typeof AnalyzeAdherenceTimingPatternsOutputSchema>;

export async function analyzeAdherenceTimingPatterns(
  input: AnalyzeAdherenceTimingPatternsInput
): Promise<AnalyzeAdherenceTimingPatternsOutput> {
  return analyzeAdherenceTimingPatternsFlow(input);
}

const analyzeAdherenceTimingPatternsPrompt = ai.definePrompt({
  name: 'analyzeAdherenceTimingPatternsPrompt',
  input: {schema: AnalyzeAdherenceTimingPatternsInputSchema},
  output: {schema: AnalyzeAdherenceTimingPatternsOutputSchema},
  prompt: `You are a healthcare data visualization expert. Analyze the provided medication intake data to identify patterns in adherence at different times of the day. Generate a time-of-day heatmap visualization that highlights periods of high and low adherence. Also, provide key insights based on the generated visualization. Make sure the heatmap is visually clear and easy to interpret for healthcare professionals. Return the heatmap as a data URI.

Medication Intake Data: {{{JSON.stringify input}}}

Consider how different medications may have different adherence patterns, and highlight these in the insights.
If there are no patterns, clearly state that.

Output:
Heatmap Data URI: (data URI of the heatmap visualization)
Insights: (Key insights derived from the heatmap analysis)`, // Added insights to prompt
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzeAdherenceTimingPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeAdherenceTimingPatternsFlow',
    inputSchema: AnalyzeAdherenceTimingPatternsInputSchema,
    outputSchema: AnalyzeAdherenceTimingPatternsOutputSchema,
  },
  async input => {
    const {output} = await analyzeAdherenceTimingPatternsPrompt(input);
    return output!;
  }
);
