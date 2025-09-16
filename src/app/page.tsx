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
  Users,
  Briefcase,
  BookCopy,
  BarChart,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const whyUsFeatures = [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: 'Expert Analysis',
      description: 'Our AI is trained by legal experts to provide you with accurate and insightful analysis.',
    },
    {
      icon: <BookCopy className="h-8 w-8 text-primary" />,
      title: 'Comprehensive Coverage',
      description: 'Analyze any Terms of Service document, no matter how complex or lengthy.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community Driven',
      description: 'Join a community of users and experts to share insights and get help.',
    },
  ];

  const mainFeatures = [
    {
      title: 'AI-Powered Summary',
      description: 'Get a quick, easy-to-understand summary of any Terms of Service document in a single paragraph.',
      level: 'Beginner',
      Icon: BookOpenText,
      lessons: '1-Click',
    },
    {
      title: 'Key Clause Identification',
      description: 'Automatically finds and explains important clauses like Limitation of Liability, IP Rights, and User Conduct.',
      level: 'Intermediate',
      Icon: KeyRound,
      lessons: '3 Clauses',
    },
    {
      title: 'Risk & Gap Analysis',
      description: 'Discovers potential risks, vague language, and missing clauses, with a focus on legal standards.',
      level: 'Advanced',
      Icon: ShieldAlert,
      lessons: '5+ Checks',
    },
  ];


  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-screen">
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

        {/* Why Us Section */}
        <section id="why-us" className="py-20">
          <div className="container mx-auto w-full max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-bold">Why use Legal Lens?</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {whyUsFeatures.map((feature) => (
                <div key={feature.title} className="text-center flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20">
            <div className="container mx-auto w-full max-w-6xl px-4">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {mainFeatures.map((feature, index) => (
                        <Card key={feature.title} className="bg-card/50 backdrop-blur-sm border-white/10 flex flex-col">
                            <CardContent className="p-6 flex-1">
                                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0 flex justify-between items-center text-muted-foreground">
                              <div className='flex items-center gap-2'>
                                {feature.level === 'Beginner' && <BarChart className="w-4 h-4" />}
                                {feature.level === 'Intermediate' && <BarChart className="w-4 h-4" />}
                                {feature.level === 'Advanced' && <GraduationCap className="w-4 h-4" />}
                                <span>{feature.level}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <BookCopy className="w-4 h-4" />
                                <span>{feature.lessons}</span>
                              </div>
                            </CardFooter>
                            {index === 0 && <div className="h-1 bg-primary w-full rounded-b-lg"></div>}
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
