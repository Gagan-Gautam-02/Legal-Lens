'use server';

import { 
  analyzeRiskGaps, 
  type AnalyzeRiskGapsOutput 
} from '@/ai/flows/analyze-risk-gaps';
import { 
  answerQuestionsAboutToS, 
  type AnswerQuestionsAboutToSOutput 
} from '@/ai/flows/answer-tos-questions';
import { 
  identifyKeyClauses,
  type IdentifyKeyClausesOutput
} from '@/ai/flows/identify-key-clauses';
import { 
  summarizeTermsOfService,
  type SummarizeTermsOfServiceOutput
} from '@/ai/flows/summarize-tos';

export interface AnalysisResult {
  summary: SummarizeTermsOfServiceOutput;
  keyClauses: IdentifyKeyClausesOutput;
  riskGaps: AnalyzeRiskGapsOutput;
}

export async function analyzeTos(tosDocument: string): Promise<{ data?: AnalysisResult; error?: string }> {
  if (!tosDocument || tosDocument.trim().length < 100) {
    return { error: 'Please provide a Terms of Service document with at least 100 characters.' };
  }

  try {
    const [summary, keyClauses, riskGaps] = await Promise.all([
      summarizeTermsOfService({ termsOfService: tosDocument }),
      identifyKeyClauses({ tosDocument }),
      analyzeRiskGaps({ tosDocument }),
    ]);

    return { data: { summary, keyClauses, riskGaps } };
  } catch (e) {
    console.error(e);
    // Provide a user-friendly error message
    return { error: 'An unexpected error occurred during analysis. The AI model may be unavailable. Please try again later.' };
  }
}

export async function answerQuestion(tosDocument: string, question: string): Promise<{ data?: AnswerQuestionsAboutToSOutput; error?: string }> {
  if (!question || question.trim().length === 0) {
    return { error: 'Please enter a question.' };
  }
   if (!tosDocument) {
    return { error: 'The document context is missing. Please start over.' };
  }

  try {
    const answer = await answerQuestionsAboutToS({ tosDocument, question });
    return { data: answer };
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while getting the answer. Please try again.' };
  }
}
