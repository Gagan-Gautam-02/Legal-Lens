'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { getLegalPathways, type SuggestLegalPathwaysOutput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  businessType: z.string().min(1, 'Business type is required.'),
  businessDescription: z.string().min(20, 'Please provide a more detailed description (at least 20 characters).'),
});

export default function LegalPathwaysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pathway, setPathway] = useState<SuggestLegalPathwaysOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: '',
      businessDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setPathway(null);

    const result = await getLegalPathways(values.businessType, values.businessDescription);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    } else if (result.data) {
      setPathway(result.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-headline flex items-center gap-3">
                <Briefcase className="h-8 w-8" />
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
                          <FormLabel>Business Type</FormLabel>
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
                        <FormLabel>Business Description</FormLabel>
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
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Key Legal Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {pathway.legalRequirements.map((req, index) => (
                       <li key={index} className="flex items-start gap-4">
                         <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                         <div>
                            <h4 className="font-semibold">{req.title}</h4>
                            <p className="text-muted-foreground">{req.description}</p>
                         </div>
                       </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Suggested Step-by-Step Pathway</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {pathway.suggestedSteps.map((step) => (
                            <AccordionItem value={`step-${step.step}`} key={step.step}>
                                <AccordionTrigger>
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
      <Footer />
    </div>
  );
}
