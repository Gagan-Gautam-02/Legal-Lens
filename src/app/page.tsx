'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import {
  ArrowRight,
  BookOpenText,
  FileQuestion,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const features = [
    {
      icon: <BookOpenText className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Summary',
      description: 'Get a quick, easy-to-understand summary of any Terms of Service document in a single paragraph.',
    },
    {
      icon: <KeyRound className="h-8 w-8 text-primary" />,
      title: 'Key Clause Identification',
      description: 'Automatically finds and explains important clauses like Limitation of Liability, IP Rights, and User Conduct.',
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-primary" />,
      title: 'Risk & Gap Analysis',
      description: 'Discovers potential risks, vague language, and missing clauses, with a focus on legal standards.',
    },
    {
      icon: <FileQuestion className="h-8 w-8 text-primary" />,
      title: 'Ask Specific Questions',
      description: 'Get clear, simple answers to your specific questions about the document from our AI legal analyst.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="space-y-6">
            <h1 className="font-headline text-5xl font-bold tracking-tight">
              Welcome to Legal Lens
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered assistant for analyzing Terms of Service
              documents. Understand complex legal language in minutes.
            </p>
             <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-secondary/50 py-20">
            <div className="container mx-auto w-full max-w-4xl px-4">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-4xl font-bold">Features</h2>
                    <p className="text-lg text-muted-foreground mt-2">Everything you need to decode legal documents.</p>
                 </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {features.map((feature) => (
                        <Card key={feature.title} className="text-center w-full">
                            <CardHeader className="flex flex-col items-center gap-4">
                                {feature.icon}
                                <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto w-full max-w-4xl px-4 py-20 text-center">
             <div className="space-y-6">
                <h2 className="font-headline text-4xl font-bold">Ready to Dive In?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                   Create an account to start analyzing your first document for free.
                </p>
                <div className="flex justify-center">
                    <Button asChild size="lg">
                        <Link href="/signup">
                            Sign Up Now <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
             </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
