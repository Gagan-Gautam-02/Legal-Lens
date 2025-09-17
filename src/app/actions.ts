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
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

export interface AnalysisResult {
  summary: SummarizeTermsOfServiceOutput;
  keyClauses: IdentifyKeyClausesOutput;
  riskGaps: AnalyzeRiskGapsOutput;
}

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!))
    });
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK:', e);
  }
}

const db = getFirestore();

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

export async function answerQuestion(
  tosDocument: string, 
  question: string,
  userId: string,
  analysisId: string
  ): Promise<{ data?: AnswerQuestionsAboutToSOutput; error?: string }> {
  if (!question || question.trim().length === 0) {
    return { error: 'Please enter a question.' };
  }
   if (!tosDocument) {
    return { error: 'The document context is missing. Please start over.' };
  }

  try {
    const answer = await answerQuestionsAboutToS({ tosDocument, question });
    if (answer && userId && analysisId) {
      await db.collection('users').doc(userId).collection('history').doc(analysisId).collection('conversations').add({
        question,
        answer: answer.answer,
        createdAt: new Date(),
      });
    }
    return { data: answer };
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while getting the answer. Please try again.' };
  }
}

export async function getConversationHistory(userId: string, analysisId: string): Promise<Conversation[]> {
  try {
    const snapshot = await db.collection('users').doc(userId).collection('history').doc(analysisId).collection('conversations').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}
