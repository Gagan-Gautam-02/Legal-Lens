'use server';

import {
  analyzeRiskGaps,
  type AnalyzeRiskGapsOutput,
} from '@/ai/flows/analyze-risk-gaps';
import {
  answerQuestionsAboutToS,
  type AnswerQuestionsAboutToSOutput,
} from '@/ai/flows/answer-tos-questions';
import {
  identifyKeyClauses,
  type IdentifyKeyClausesOutput,
} from '@/ai/flows/identify-key-clauses';
import {
  summarizeTermsOfService,
  type SummarizeTermsOfServiceOutput,
} from '@/ai/flows/summarize-tos';
import {
  suggestLegalPathways,
  type SuggestLegalPathwaysOutput,
} from '@/ai/flows/suggest-legal-pathways';
import {
  answerLegalPathwayQuestion,
  type AnswerLegalPathwayQuestionOutput,
} from '@/ai/flows/answer-legal-pathways-questions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';

export interface AnalysisResult {
  summary: SummarizeTermsOfServiceOutput;
  keyClauses: IdentifyKeyClausesOutput;
  riskGaps: AnalyzeRiskGapsOutput;
}

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  createdAt: any;
}

export type { SuggestLegalPathwaysOutput, AnswerLegalPathwayQuestionOutput };

function initializeFirebaseAdmin(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      console.log('Found FIREBASE_SERVICE_ACCOUNT_KEY. Initializing Firebase Admin SDK...');
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', e);
      return null;
    }
  } else {
    console.warn(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firestore database operations will fail.'
    );
    return null;
  }
}

async function getDb() {
  const app = initializeFirebaseAdmin();
  if (!app) {
    return null;
  }
  return getFirestore(app);
}

export async function analyzeTos(
  tosDocument: string
): Promise<{ data?: AnalysisResult; error?: string }> {
  if (!tosDocument || tosDocument.trim().length < 100) {
    return {
      error:
        'Please provide a Terms of Service document with at least 100 characters.',
    };
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
    return {
      error:
        'An unexpected error occurred during analysis. The AI model may be unavailable. Please try again later.',
    };
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
    const db = await getDb();
    if (answer && userId && analysisId && db) {
      try {
        await db
          .collection('users')
          .doc(userId)
          .collection('history')
          .doc(analysisId)
          .collection('conversations')
          .add({
            question,
            answer: answer.answer,
            createdAt: Timestamp.now(),
          });
      } catch (dbError) {
        console.error('Firestore write error:', dbError);
        return {
          error:
            'Could not save conversation to history due to a database error.',
        };
      }
    } else if (!db) {
        console.warn("Firestore is not initialized, skipping history save.");
    }
    return { data: answer };
  } catch (e) {
    console.error(e);
    return {
      error: 'An error occurred while getting the answer. Please try again.',
    };
  }
}

export async function getConversationHistory(
  userId: string,
  analysisId: string
): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(analysisId)
      .collection('conversations')
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Conversation)
    );
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

export async function getAnalysisHistory(userId: string): Promise<any[]> {
    const db = await getDb();
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const snapshot = await db.collection('users').doc(userId).collection('history').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        return [];
    }
}


export async function getLegalPathways(
  businessType: string,
  businessDescription: string,
): Promise<{ data?: SuggestLegalPathwaysOutput; error?: string }> {
  if (!businessType || !businessDescription) {
    return { error: 'Please provide both a business type and a description.' };
  }

  try {
    const data = await suggestLegalPathways({ businessType, businessDescription });
    return { data };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while generating legal pathways. Please try again later.' };
  }
}

export async function saveLegalPathway(
  userId: string,
  businessType: string,
  businessDescription: string,
  pathway: SuggestLegalPathwaysOutput
): Promise<{ pathwayId?: string, error?: string }> {
  const db = await getDb();
  if (!db) {
    return { error: "Database not initialized." };
  }

  try {
    const pathwayRef = db.collection('users').doc(userId).collection('legalPathways').doc();
    await pathwayRef.set({
      businessType,
      businessDescription,
      pathway,
      createdAt: Timestamp.now()
    });
    return { pathwayId: pathwayRef.id };
  } catch (e) {
    console.error("Error saving legal pathway:", e);
    return { error: "Could not save the legal pathway to your history." };
  }
}

export async function askLegalPathwayQuestion(
    userId: string,
    pathwayId: string,
    businessType: string,
    businessDescription: string,
    legalPathway: string,
    question: string,
): Promise<{ data?: AnswerLegalPathwayQuestionOutput; error?: string }> {
    if (!question || question.trim().length === 0) {
        return { error: 'Please enter a question.' };
    }

    const db = await getDb();
    if (!db) {
        return { error: "Database not initialized." };
    }

    try {
        const answer = await answerLegalPathwayQuestion({
            businessType,
            businessDescription,
            legalPathway,
            question
        });

        await db.collection('users').doc(userId).collection('legalPathways').doc(pathwayId).collection('conversations').add({
            question,
            answer: answer.answer,
            createdAt: Timestamp.now()
        });

        return { data: answer };
    } catch (e) {
        console.error(e);
        return { error: 'An error occurred while getting the answer. Please try again.' };
    }
}

export async function getLegalPathwaysHistory(userId: string): Promise<any[]> {
    const db = await getDb();
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const snapshot = await db.collection('users').doc(userId).collection('legalPathways').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching legal pathways history:', error);
        return [];
    }
}
