'use server';

/**
 * @fileOverview Analyzes the Terms of Service document for potential risks,
 * ambiguous clauses, and missing clauses, especially considering Indian laws.
 *
 * - analyzeRiskGaps - A function that analyzes the ToS document and returns potential risks and gaps.
 * - AnalyzeRiskGapsInput - The input type for the analyzeRiskGaps function.
 * - AnalyzeRiskGapsOutput - The return type for the analyzeRiskGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRiskGapsInputSchema = z.object({
  tosDocument: z.string().describe('The Terms of Service document to analyze.'),
  language: z.string().describe('The language for the analysis (e.g., "English", "Hindi").'),
});
export type AnalyzeRiskGapsInput = z.infer<typeof AnalyzeRiskGapsInputSchema>;

const AnalyzeRiskGapsOutputSchema = z.object({
  risks: z.array(z.string()).describe('An array of potential risks identified in the ToS.'),
  ambiguousClauses: z
    .array(z.string())
    .describe('An array of ambiguous clauses identified in the ToS.'),
  missingClauses: z
    .array(z.string())
    .describe(
      'An array of missing clauses that should be included in the ToS, considering Indian laws like the Digital Personal Data Protection Act, 2023.'
    ),
});
export type AnalyzeRiskGapsOutput = z.infer<typeof AnalyzeRiskGapsOutputSchema>;

export async function analyzeRiskGaps(input: AnalyzeRiskGapsInput): Promise<AnalyzeRiskGapsOutput> {
  return analyzeRiskGapsFlow(input);
}

const analyzeRiskGapsPrompt = ai.definePrompt({
  name: 'analyzeRiskGapsPrompt',
  input: {schema: AnalyzeRiskGapsInputSchema},
  output: {schema: AnalyzeRiskGapsOutputSchema},
  prompt: `You are a legal expert specializing in Indian law. Analyze the following Terms of Service document to identify potential risks, ambiguous clauses, and missing clauses, especially considering Indian laws like the Digital Personal Data. Protection Act, 2023.

Provide the analysis in the following language: {{{language}}}.

Terms of Service Document:
{{{tosDocument}}}

Identify and list potential risks, ambiguous clauses, and missing clauses in the following format:

Risks:
- [Risk 1]
- [Risk 2]

Ambiguous Clauses:
- [Ambiguous Clause 1]
- [Ambiguous Clause 2]

Missing Clauses:
- [Missing Clause 1] (Considering Indian laws like the Digital Personal Data Protection Act, 2023.)
- [Missing Clause 2] (Considering Indian laws like the Digital Personal Data Protection Act, 2023.)`,
});

const analyzeRiskGapsFlow = ai.defineFlow(
  {
    name: 'analyzeRiskGapsFlow',
    inputSchema: AnalyzeRiskGapsInputSchema,
    outputSchema: AnalyzeRiskGapsOutputSchema,
  },
  async input => {
    const {output} = await analyzeRiskGapsPrompt(input);
    return output!;
  }
);
