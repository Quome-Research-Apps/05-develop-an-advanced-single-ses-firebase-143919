import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-missing-medication-reasons.ts';
import '@/ai/flows/suggest-optimal-intake-times.ts';
import '@/ai/flows/analyze-adherence-timing-patterns.ts';