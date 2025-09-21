'use server';

/**
 * @fileOverview Answers questions about a generated legal pathway for a startup.
 *
 * - answerLegalPathwayQuestion - A function that takes context and a question, and returns an answer.
 * - AnswerLegalPathwayQuestionInput - The input type for the function.
 * - AnswerLegalPathwayQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerLegalPathwayQuestionInputSchema = z.object({
  businessType: z.string().describe('The type of business or startup.'),
  businessDescription: z.string().describe('The description of the business.'),
  legalPathway: z.string().describe('The previously generated legal pathway document.'),
  question: z.string().describe('The user\'s question about the legal pathway.'),
});
export type AnswerLegalPathwayQuestionInput = z.infer<
  typeof AnswerLegalPathwayQuestionInputSchema
>;

const AnswerLegalPathwayQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerLegalPathwayQuestionOutput = z.infer<
  typeof AnswerLegalPathwayQuestionOutputSchema
>;

export async function answerLegalPathwayQuestion(
  input: AnswerLegalPathwayQuestionInput
): Promise<AnswerLegalPathwayQuestionOutput> {
  return answerLegalPathwayQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerLegalPathwayQuestionPrompt',
  input: {schema: AnswerLegalPathwayQuestionInputSchema},
  output: {schema: AnswerLegalPathwayQuestionOutputSchema},
  prompt: `You are an expert legal analyst specializing in Indian startup law. You will be provided with a business context, a generated legal pathway, and a user's question about it. Provide a simple, clear, and understandable answer based on the provided context.

Business Type:
{{{businessType}}}

Business Description:
{{{businessDescription}}}

Generated Legal Pathway:
{{{legalPathway}}}

Question:
{{{question}}}`,
});

const answerLegalPathwayQuestionFlow = ai.defineFlow(
  {
    name: 'answerLegalPathwayQuestionFlow',
    inputSchema: AnswerLegalPathwayQuestionInputSchema,
    outputSchema: AnswerLegalPathwayQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
