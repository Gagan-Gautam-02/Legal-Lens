'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Header } from '@/components/app/header';
import { getLegalPathways, saveLegalPathway, type SuggestLegalPathwaysOutput, type Conversation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, ChevronRight, MessageSquare, User, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LegalPathwayQuestionArea } from '@/components/app/legal-pathway-question-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';


const formSchema = z.object({
  businessType: z.string().min(1, 'Business type is required.'),
  businessDescription: z.string().min(20, 'Please provide a more detailed description (at least 20 characters).'),
});

export default function LegalPathwaysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pathway, setPathway] = useState<SuggestLegalPathwaysOutput | null>(null);
  const [pathwayId, setPathwayId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && pathwayId) {
        const q = query(collection(db, 'users', user.uid, 'legalPathways', pathwayId, 'conversations'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const history: Conversation[] = [];
            querySnapshot.forEach((doc) => {
                history.push({ id: doc.id, ...doc.data() } as Conversation);
            });
            setConversationHistory(history);
        });
        return () => unsubscribe();
    }
  }, [user, pathwayId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: '',
      businessDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You need to be logged in.' });
      return;
    }
    setIsLoading(true);
    setPathway(null);
    setPathwayId(null);
    setConversationHistory([]);

    const result = await getLegalPathways(values.businessType, values.businessDescription);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    } else if (result.data) {
      setPathway(result.data);
      const saveResult = await saveLegalPathway(user.uid, values.businessType, values.businessDescription, result.data);
      if (saveResult.pathwayId) {
        setPathwayId(saveResult.pathwayId);
      } else {
        toast({
            variant: 'destructive',
            title: 'History Error',
            description: saveResult.error,
        });
      }
    }
    setIsLoading(false);
  };
  
  const getPathwayAsString = () => {
    if (!pathway) return '';
    const requirements = pathway.legalRequirements.map(req => `Requirement: ${req.title}\n${req.description}`).join('\n\n');
    const steps = pathway.suggestedSteps.map(step => `Step ${step.step}: ${step.title}\n${step.description}`).join('\n\n');
    return `Legal Requirements:\n${requirements}\n\nSuggested Steps:\n${steps}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="mb-8 glass-card">
            <CardHeader>
              <CardTitle className="text-3xl font-headline flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Legal Pathways for Startups
              </CardTitle>
              <CardDescription>
                Get AI-powered legal guidance for your new business venture in India.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary">Business Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., E-commerce, SaaS, EdTech" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-secondary">Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your business idea, target audience, and key activities."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Pathway...
                      </>
                    ) : (
                      'Generate Legal Pathway'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Generating your legal roadmap...</p>
              <p className="text-muted-foreground">The AI is analyzing your business details.</p>
            </div>
          )}

          {pathway && (
            <div className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Key Legal Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {pathway.legalRequirements.map((req, index) => (
                       <li key={index} className="flex items-start gap-4">
                         <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                         <div>
                            <h4 className="font-semibold text-secondary">{req.title}</h4>
                            <p className="text-muted-foreground">{req.description}</p>
                         </div>
                       </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Suggested Step-by-Step Pathway</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {pathway.suggestedSteps.map((step) => (
                            <AccordionItem value={`step-${step.step}`} key={step.step}>
                                <AccordionTrigger className="text-secondary">
                                <span className="text-primary font-bold mr-4">Step {step.step}</span>
                                {step.title}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                {step.description}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
              </Card>
              
               {user && pathwayId && (
                    <>
                         <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline">
                                <MessageSquare className="h-6 w-6 text-primary" />
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
                                            <AvatarFallback className="bg-secondary text-secondary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 rounded-lg border p-3 text-sm bg-secondary/10">
                                            <p className="font-semibold text-secondary">VeriLaw AI</p>
                                            <p className="text-foreground/80">{entry.answer}</p>
                                        </div>
                                        </div>
                                    </div>
                                    )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                        <MessageSquare className="h-10 w-10 mb-4" />
                                        <p className="font-medium">No questions asked yet.</p>
                                        <p className="text-sm">Ask a question about this legal pathway below.</p>
                                    </div>
                                    )}
                                </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <LegalPathwayQuestionArea
                            userId={user.uid}
                            pathwayId={pathwayId}
                            businessType={form.getValues('businessType')}
                            businessDescription={form.getValues('businessDescription')}
                            legalPathway={getPathwayAsString()}
                        />
                    </>
               )}

              <Alert variant="destructive" className="bg-amber-100/50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800">
                <Briefcase className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">Professional Advice Recommended</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  This AI-generated guidance is for informational purposes only and does not constitute legal advice. Always consult with a qualified legal professional, CA, or CS for your specific business needs.
                </AlertDescription>
              </Alert>
            </div>
          )}

           {!pathway && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full rounded-lg border border-dashed p-12 text-center bg-card min-h-[300px]">
                <div className="text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Ready to build your startup?</p>
                  <p className="text-muted-foreground">Fill out the form above to get your personalized legal roadmap.</p>
                </div>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
