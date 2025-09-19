'use server';

/**
 * @fileOverview Suggests legal pathways for starting a new startup or business in India.
 *
 * - suggestLegalPathways - A function that suggests legal requirements and steps.
 * - SuggestLegalPathwaysInput - The input type for the suggestLegalPathways function.
 * - SuggestLegalPathwaysOutput - The return type for the suggestLegalPathways function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLegalPathwaysInputSchema = z.object({
  businessType: z.string().describe('The type of business or startup (e.g., E-commerce, Tech, Services).'),
  businessDescription: z.string().describe('A detailed description of the business or startup idea.'),
});
export type SuggestLegalPathwaysInput = z.infer<typeof SuggestLegalPathwaysInputSchema>;

const SuggestLegalPathwaysOutputSchema = z.object({
  legalRequirements: z.array(z.object({
    title: z.string().describe('The title of the legal requirement.'),
    description: z.string().describe('A detailed explanation of the requirement.'),
  })).describe('An array of key legal requirements for the startup.'),
  suggestedSteps: z.array(z.object({
    step: z.number().describe('The step number.'),
    title: z.string().describe('The title of the step.'),
    description: z.string().describe('A detailed explanation of the step.'),
  })).describe('A suggested step-by-step legal pathway for setting up the business.'),
});
export type SuggestLegalPathwaysOutput = z.infer<typeof SuggestLegalPathwaysOutputSchema>;


export async function suggestLegalPathways(input: SuggestLegalPathwaysInput): Promise<SuggestLegalPathwaysOutput> {
    return suggestLegalPathwaysFlow(input);
}


const prompt = ai.definePrompt({
    name: 'suggestLegalPathwaysPrompt',
    input: {schema: SuggestLegalPathwaysInputSchema},
    output: {schema: SuggestLegalPathwaysOutputSchema},
    prompt: `You are an expert legal advisor for startups in India. Based on the provided business type and description, generate a detailed legal pathway.

    Your response should focus on Indian law and regulations. Provide a list of key legal requirements and a clear, step-by-step guide to follow.

    Business Type: {{{businessType}}}
    Business Description: {{{businessDescription}}}
    
    Structure your output clearly with distinct sections for legal requirements and suggested steps.`,
});


const suggestLegalPathwaysFlow = ai.defineFlow(
    {
        name: 'suggestLegalPathwaysFlow',
        inputSchema: SuggestLegalPathwaysInputSchema,
        outputSchema: SuggestLegalPathwaysOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
