'use server';

/**
 * @fileOverview Identifies and explains key clauses in a Terms of Service document.
 *
 * - identifyKeyClauses - A function that identifies and explains key clauses in a Terms of Service document.
 * - IdentifyKeyClausesInput - The input type for the identifyKeyClauses function.
 * - IdentifyKeyClausesOutput - The return type for the identifyKeyClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyKeyClausesInputSchema = z.object({
  tosDocument: z.string().describe('The Terms of Service document to analyze.'),
});
export type IdentifyKeyClausesInput = z.infer<typeof IdentifyKeyClausesInputSchema>;

const IdentifyKeyClausesOutputSchema = z.object({
  clauses: z.array(
    z.object({
      clauseName: z.string().describe('The name of the key clause.'),
      explanation: z.string().describe('The explanation of the key clause.'),
    })
  ).describe('The identified key clauses and their explanations.'),
});
export type IdentifyKeyClausesOutput = z.infer<typeof IdentifyKeyClausesOutputSchema>;

export async function identifyKeyClauses(input: IdentifyKeyClausesInput): Promise<IdentifyKeyClausesOutput> {
  return identifyKeyClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyKeyClausesPrompt',
  input: {schema: IdentifyKeyClausesInputSchema},
  output: {schema: IdentifyKeyClausesOutputSchema},
  prompt: `You are a legal expert analyzing Terms of Service documents. Identify and explain the following key clauses from the document below:\n\n- Limitation of Liability\n- Intellectual Property Rights\n- User Conduct\n
Document: {{{tosDocument}}}`,
});

const identifyKeyClausesFlow = ai.defineFlow(
  {
    name: 'identifyKeyClausesFlow',
    inputSchema: IdentifyKeyClausesInputSchema,
    outputSchema: IdentifyKeyClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
