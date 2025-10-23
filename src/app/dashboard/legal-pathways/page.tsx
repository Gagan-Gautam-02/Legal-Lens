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
import { getLegalPathways, saveLegalPathway, getLegalPathwaysHistory, type SuggestLegalPathwaysOutput, type Conversation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, ChevronRight, MessageSquare, User, Bot, History } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LegalPathwayQuestionArea } from '@/components/app/legal-pathway-question-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { onSnapshot, collection, query, orderBy, getDoc, doc, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const formSchema = z.object({
  businessType: z.string().min(1, 'Business type is required.'),
  businessDescription: z.string().min(20, 'Please provide a more detailed description (at least 20 characters).'),
});

interface PathwayHistoryItem {
  id: string;
  businessType: string;
  businessDescription: string;
  pathway: SuggestLegalPathwaysOutput;
  createdAt: Timestamp;
}

export default function LegalPathwaysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pathway, setPathway] = useState<SuggestLegalPathwaysOutput | null>(null);
  const [pathwayId, setPathwayId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [pathwayHistory, setPathwayHistory] = useState<PathwayHistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<PathwayHistoryItem | null>(null);
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
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'legalPathways'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const history: PathwayHistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() } as PathwayHistoryItem);
        });
        setPathwayHistory(history);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe = () => {};
    const pathwayToUse = selectedHistory ? selectedHistory.id : pathwayId;
    if (user && pathwayToUse) {
        const q = query(collection(db, 'users', user.uid, 'legalPathways', pathwayToUse, 'conversations'), orderBy('createdAt', 'asc'));
        unsubscribe = onSnapshot(q, (querySnapshot) => {
            const history: Conversation[] = [];
            querySnapshot.forEach((doc) => {
                history.push({ id: doc.id, ...doc.data() } as Conversation);
            });
            setConversationHistory(history);
        });
    }
    return () => unsubscribe();
  }, [user, pathwayId, selectedHistory]);

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
    setSelectedHistory(null);
    form.reset(values);

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

  const handleHistoryClick = async (item: PathwayHistoryItem) => {
    if (!user) return;
    setPathway(null);
    setPathwayId(null);
    setConversationHistory([]);
    form.reset({ businessType: item.businessType, businessDescription: item.businessDescription });
    
    const docRef = doc(db, 'users', user.uid, 'legalPathways', item.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedHistory({ id: item.id, ...data } as PathwayHistoryItem);
        if (item.createdAt) {
          toast({ title: 'Loaded History', description: `Displaying pathway from ${formatDistanceToNow(item.createdAt.toDate())} ago.`});
        } else {
          toast({ title: 'Loaded History', description: 'Displaying a past pathway.' });
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the selected pathway history.' });
    }
  }

  const clearSelectedHistory = () => {
    setSelectedHistory(null);
    setConversationHistory([]);
    form.reset({ businessType: '', businessDescription: '' });
  }

  const currentPathway = selectedHistory ? selectedHistory.pathway : pathway;
  const currentPathwayId = selectedHistory ? selectedHistory.id : pathwayId;
  
  const getPathwayAsString = (p: SuggestLegalPathwaysOutput | null) => {
    if (!p) return '';
    const requirements = p.legalRequirements.map(req => `Requirement: ${req.title}\n${req.description}`).join('\n\n');
    const steps = p.suggestedSteps.map(step => `Step ${step.step}: ${step.title}\n${step.description}`).join('\n\n');
    return `Legal Requirements:\n${requirements}\n\nSuggested Steps:\n${steps}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full py-8">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
          
          {/* Left Column: Pathway Display */}
          <div className="md:col-span-2">
            {isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Generating your legal roadmap...</p>
                <p className="text-muted-foreground">The AI is analyzing your business details.</p>
              </div>
            )}

            {currentPathway && (
              <div className="space-y-8">
                 {selectedHistory && (
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline text-primary">Viewing Past Pathway</h2>
                    <Button variant="outline" onClick={clearSelectedHistory}>
                        Close History
                    </Button>
                  </div>
                 )}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-headline text-primary">Key Legal Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {currentPathway.legalRequirements.map((req, index) => (
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
                          {currentPathway.suggestedSteps.map((step) => (
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
                
                 {user && currentPathwayId && (
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
                              pathwayId={currentPathwayId}
                              businessType={form.getValues('businessType')}
                              businessDescription={form.getValues('businessDescription')}
                              legalPathway={getPathwayAsString(currentPathway)}
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

             {!currentPathway && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full rounded-lg border border-dashed p-12 text-center bg-card min-h-[300px]">
                  <div className="text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Ready to build your startup?</p>
                    <p className="text-muted-foreground">Fill out the form to get your personalized legal roadmap.</p>
                  </div>
                </div>
             )}
          </div>
          
          {/* Right Column: Input and History */}
          <div className="col-span-1 flex flex-col gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-primary" />
                  Legal Pathway Generator
                </CardTitle>
                <CardDescription>
                  Get AI-powered legal guidance for your new business venture in India.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
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
                    <Button type="submit" disabled={isLoading} className="w-full">
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

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <History className="h-6 w-6 text-primary" />
                        Pathway History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-60">
                        {pathwayHistory.length > 0 ? (
                            <div className="space-y-2">
                                {pathwayHistory.map((item) => (
                                    <div key={item.id} className="p-3 rounded-md border hover:bg-muted cursor-pointer" onClick={() => handleHistoryClick(item)}>
                                        <p className="text-sm font-medium truncate">{item.businessType} - {item.businessDescription}</p>
                                        {item.createdAt && (
                                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(item.createdAt.toDate())} ago</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <History className="h-10 w-10 mb-4" />
                                <p className="font-medium">No history yet.</p>
                                <p className="text-sm">Your past pathways will appear here.</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
