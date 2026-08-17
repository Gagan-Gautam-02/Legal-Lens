'use server';

/**
 * @fileOverview Answers questions about a Terms of Service document.
 *
 * - answerQuestionsAboutToS - A function that takes a ToS document and a question, and returns an answer.
 * - AnswerQuestionsAboutToSInput - The input type for the answerQuestionsAboutToS function.
 * - AnswerQuestionsAboutToSOutput - The return type for the answerQuestionsAboutToS function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutToSInputSchema = z.object({
  tosDocument: z.string().describe('The Terms of Service document to answer questions about.'),
  question: z.string().describe('The question to answer about the Terms of Service document.'),
});
export type AnswerQuestionsAboutToSInput = z.infer<
  typeof AnswerQuestionsAboutToSInputSchema
>;

const AnswerQuestionsAboutToSOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerQuestionsAboutToSOutput = z.infer<
  typeof AnswerQuestionsAboutToSOutputSchema
>;

export async function answerQuestionsAboutToS(
  input: AnswerQuestionsAboutToSInput
): Promise<AnswerQuestionsAboutToSOutput> {
  return answerQuestionsAboutToSFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutToSPrompt',
  input: {schema: AnswerQuestionsAboutToSInputSchema},
  output: {schema: AnswerQuestionsAboutToSOutputSchema},
  prompt: `You are an expert legal analyst. You will be provided with a Terms of Service document, and you will answer a question about it. Provide a simple and understandable answer.

Terms of Service Document:
{{{tosDocument}}}

Question:
{{{question}}}`,
});

const answerQuestionsAboutToSFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutToSFlow',
    inputSchema: AnswerQuestionsAboutToSInputSchema,
    outputSchema: AnswerQuestionsAboutToSOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
