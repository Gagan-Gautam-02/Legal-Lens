'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askLegalPathwayQuestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileQuestion } from 'lucide-react';

const formSchema = z.object({
  question: z.string().min(5, {
    message: 'Question must be at least 5 characters.',
  }),
});

interface LegalPathwayQuestionAreaProps {
    userId: string;
    pathwayId: string;
    businessType: string;
    businessDescription: string;
    legalPathway: string;
}

export function LegalPathwayQuestionArea({ userId, pathwayId, businessType, businessDescription, legalPathway }: LegalPathwayQuestionAreaProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: '' },
  });

  const handleQuestionSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsAnswering(true);

    const result = await askLegalPathwayQuestion(
        userId,
        pathwayId,
        businessType,
        businessDescription,
        legalPathway,
        values.question
    );

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      // The answer is now saved to Firestore and will appear in the history
      form.reset();
    }
    
    setIsAnswering(false);
  };

  return (
     <Card className="glass-card">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
            <FileQuestion className="h-6 w-6 text-primary" />
            Ask a Follow-up Question
            </CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Have a specific question about this legal pathway? Ask our AI for a simple, understandable answer.
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="flex items-start gap-2">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                            <Input 
                                placeholder="e.g., What is an MSME registration?" 
                                {...field} 
                                disabled={isAnswering}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isAnswering}>
                        {isAnswering ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
                    </Button>
                    </form>
                </Form>
                
                {isAnswering && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Finding an answer...</span>
                    </div>
                )}
            </div>
        </CardContent>
     </Card>
  );
}
