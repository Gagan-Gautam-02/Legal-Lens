'use server';

/**
 * @fileOverview Summarizes a Terms of Service document into a single paragraph.
 *
 * - summarizeTermsOfService - A function that summarizes the Terms of Service.
 * - SummarizeTermsOfServiceInput - The input type for the summarizeTermsOfService function.
 * - SummarizeTermsOfServiceOutput - The return type for the summarizeTermsOfService function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTermsOfServiceInputSchema = z.object({
  termsOfService: z
    .string()
    .describe('The Terms of Service document to summarize.'),
  language: z.string().describe('The language for the summary (e.g., "English", "Hindi").'),
});
export type SummarizeTermsOfServiceInput = z.infer<
  typeof SummarizeTermsOfServiceInputSchema
>;

const SummarizeTermsOfServiceOutputSchema = z.object({
  summary: z
    .string()
    .describe('A one-paragraph summary of the Terms of Service.'),
});
export type SummarizeTermsOfServiceOutput = z.infer<
  typeof SummarizeTermsOfServiceOutputSchema
>;

export async function summarizeTermsOfService(
  input: SummarizeTermsOfServiceInput
): Promise<SummarizeTermsOfServiceOutput> {
  return summarizeTermsOfServiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTermsOfServicePrompt',
  input: {schema: SummarizeTermsOfServiceInputSchema},
  output: {schema: SummarizeTermsOfServiceOutputSchema},
  prompt: `Summarize the following Terms of Service document in one paragraph, in the following language: {{{language}}}.

{{{termsOfService}}}`,
});

const summarizeTermsOfServiceFlow = ai.defineFlow(
  {
    name: 'summarizeTermsOfServiceFlow',
    inputSchema: SummarizeTermsOfServiceInputSchema,
    outputSchema: SummarizeTermsOfServiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
