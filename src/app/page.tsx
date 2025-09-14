'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { analyzeTos, type AnalysisResult } from '@/app/actions';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { AnalysisDisplay } from '@/components/app/analysis-display';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, FileText, AlertTriangle, BookOpenText, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  tos: z.string().min(100, {
    message: 'Terms of Service must be at least 100 characters.',
  }),
});

function HeroInfo() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Your AI-Powered Legal Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-foreground/80">
        <p>
          Navigating legal documents can be overwhelming. Legal Lens simplifies complex Terms of Service agreements, making them easy to understand. Paste your document to get started.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <BookOpenText className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Overall Summary</h3>
              <p>Receive a concise, one-paragraph summary of the entire document in plain language.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <KeyRound className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Key Clause Breakdown</h3>
              <p>We identify and explain crucial clauses like Limitation of Liability and Intellectual Property Rights.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Risk & Gap Analysis</h3>
              <p>Our AI flags potential risks, ambiguous language, and missing clauses, with special consideration for Indian law.</p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}


function LoadingState() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border bg-card">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="font-headline text-2xl">Analyzing Document...</h2>
        <p className="max-w-sm text-muted-foreground">
          Our AI is reading through the document. This may take a moment.
        </p>
      </div>
    </div>
  );
}


export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tosContent, setTosContent] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tos: '',
    },
  });

  const handleAnalyze = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysis(null);
    setTosContent(values.tos);

    const result = await analyzeTos(values.tos);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: result.error,
      });
      setAnalysis(null);
    } else if (result.data) {
      setAnalysis(result.data);
    }
    
    setIsLoading(false);
  };

  const handleReset = () => {
    setAnalysis(null);
    setTosContent('');
    form.reset({ tos: '' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="flex-1 container mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex w-full flex-col gap-4 lg:w-1/2">
            <div className="flex items-center justify-between">
              <h1 className="font-headline text-3xl font-bold">Your Document</h1>
              {analysis && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Start Over
                </Button>
              )}
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAnalyze)} className="flex h-full flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="tos"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Paste your Terms of Service document here..."
                          className="min-h-[400px] flex-1 resize-none lg:min-h-[600px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Document'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="w-full lg:w-1/2">
            {isLoading && <LoadingState />}
            {!isLoading && !analysis && <HeroInfo />}
            {!isLoading && analysis && (
              <AnalysisDisplay analysis={analysis} tosDocument={tosContent} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
