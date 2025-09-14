'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { answerQuestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  question: z.string().min(5, {
    message: 'Question must be at least 5 characters.',
  }),
});

interface QuestionAreaProps {
  tosDocument: string;
}

export function QuestionArea({ tosDocument }: QuestionAreaProps) {
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: '' },
  });

  const handleQuestionSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsAnswering(true);
    setAnswer('');

    const result = await answerQuestion(tosDocument, values.question);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      setAnswer(result.data.answer);
    }
    
    setIsAnswering(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Have a specific question about the document? Ask our AI for a simple, understandable answer.
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
                    placeholder="e.g., How is my data used?" 
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

      {answer && (
        <Card className="bg-secondary/50">
          <CardContent className="p-4">
            <p className="text-foreground">{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
