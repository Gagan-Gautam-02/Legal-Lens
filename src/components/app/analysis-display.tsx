'use client';

import type { AnalysisResult, Conversation } from '@/app/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionArea } from '@/components/app/question-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpenText, KeyRound, ShieldAlert, AlertTriangle, FileWarning, FileQuestion, MessageSquare, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';


interface AnalysisDisplayProps {
  analysis: AnalysisResult;
  tosDocument: string;
  userId: string;
  analysisId: string;
  conversationHistory: Conversation[];
}

export function AnalysisDisplay({ analysis, tosDocument, userId, analysisId, conversationHistory }: AnalysisDisplayProps) {
  const { summary, keyClauses, riskGaps } = analysis;

  return (
    <div className="space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <BookOpenText className="h-6 w-6" />
              Overall Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80">{summary.summary}</p>
          </CardContent>
        </Card>

        {/* Key Clauses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <KeyRound className="h-6 w-6" />
              Key Clause Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {keyClauses.clauses.map((clause, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold">{clause.clauseName}</AccordionTrigger>
                  <AccordionContent className="text-foreground/80">{clause.explanation}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Risk & Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <ShieldAlert className="h-6 w-6" />
              Risk & Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="risks">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="risks">Risks ({riskGaps.risks.length})</TabsTrigger>
                <TabsTrigger value="ambiguous">Ambiguous ({riskGaps.ambiguousClauses.length})</TabsTrigger>
                <TabsTrigger value="missing">Missing ({riskGaps.missingClauses.length})</TabsTrigger>
              </TabsList>
              <div className="mt-4 rounded-md border p-4 min-h-[150px]">
                <TabsContent value="risks">
                  <AnalysisList items={riskGaps.risks} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
                </TabsContent>
                <TabsContent value="ambiguous">
                  <AnalysisList items={riskGaps.ambiguousClauses} icon={<FileWarning className="h-4 w-4 text-yellow-600" />} />
                </TabsContent>
                <TabsContent value="missing">
                  <AnalysisList items={riskGaps.missingClauses} icon={<FileQuestion className="h-4 w-4 text-blue-500" />} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Conversation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <MessageSquare className="h-6 w-6" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full pr-4">
              <div className="space-y-6">
                {conversationHistory.length > 0 ? conversationHistory.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg border p-3 text-sm bg-background">
                        <p className="font-semibold">You</p>
                        <p className="text-foreground/80">{entry.question}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                       <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                       <div className="flex-1 rounded-lg border p-3 text-sm bg-secondary/50">
                         <p className="font-semibold">Legal Lens AI</p>
                         <p className="text-foreground/80">{entry.answer}</p>
                       </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground">No questions asked yet.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Question Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileQuestion className="h-6 w-6" />
              Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionArea tosDocument={tosDocument} userId={userId} analysisId={analysisId} />
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert variant="destructive" className="bg-amber-100/50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Disclaimer</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            This tool provides an AI-generated analysis and does not constitute legal advice. The analysis may not be complete or accurate. Always consult with a qualified legal professional for any legal concerns.
          </AlertDescription>
        </Alert>
    </div>
  );
}

function AnalysisList({ items, icon }: { items: string[]; icon: React.ReactNode }) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground p-4">No items found in this category.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="mt-1">{icon}</span>
          <span className="text-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}
