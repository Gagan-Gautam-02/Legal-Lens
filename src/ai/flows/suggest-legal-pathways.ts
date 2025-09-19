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
    prompt: `You are a legal guidance AI. Your task is to generate content for a "Legal Pathway" section for a new startup. This content will be used in a chatbot interface to guide founders.

    The response should be structured clearly, with headings for each legal stage a business faces. The content must be simple, actionable, and cover both initial and future requirements.
    
    Focus on the following legal areas:
    - **Foundational Stage:** What are the first 3-4 legal steps a founder needs to take? (e.g., registration, intellectual property).
    - **Growth Stage:** What legal considerations emerge as the business grows? (e.g., hiring employees, data privacy, compliance with new laws).
    - **Scaling Stage:** What are the legal requirements for scaling up? (e.g., fundraising, international expansion).
    
    For each stage, provide 2-3 key points in a clear, non-jargon format. The tone should be informative and supportive, like a business mentor, and all content must be applicable to the Indian legal context. End with a friendly closing that encourages the user to ask more specific questions.

    Business Type: {{{businessType}}}
    Business Description: {{{businessDescription}}}`,
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
