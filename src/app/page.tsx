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
import Image from 'next/image';


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
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: 'Legal Guidance for Business',
      description: 'Get tailored legal pathways and guidance for your startup or business in India.',
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
        <section
          className="relative flex-1 flex items-center justify-start p-4 md:p-12 min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/BGMain.jpg')" }}
        >
          <div className="absolute inset-0"></div>
          <div className="relative z-10 container mx-auto flex items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
                <h1 className="font-headline text-5xl font-bold tracking-tight text-white">
                Welcome to Legal Lens
                </h1>
                <p className="text-xl text-primary-foreground/80">
                Your AI-powered assistant for analyzing Terms of Service
                documents. Understand complex legal language in minutes.
                </p>
                <div className="flex justify-start gap-4">
                <Button asChild size="lg">
                    <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2" />
                    </Link>
                </Button>
                </div>
            </div>
            <div className="hidden lg:block">
                <Image 
                    src="/Important1.png" 
                    alt="Legal document analysis" 
                    width={450} 
                    height={500} 
                    className="rounded-3xl opacity-75 animate-[move_2s_ease-in-out_infinite]"
                />
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
        <section 
          id="features" 
          className="py-20 relative bg-cover bg-center bg-no-repeat "
          style={{ backgroundImage: "url('/ImgBG.png')" }}
        >
          <div className="absolute inset-0 "></div>
          <div className="container relative z-10 mx-auto w-full max-w-6xl px-4">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-4xl font-bold text-secondary">Simplify Your Legal Documents</h2>
                    <p className="text-xl text-white max-w-2xl mx-auto mt-4">
                        From summaries to risk analysis, we've got you covered.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {mainFeatures.map((feature, index) => (
                        <Card key={feature.title} className="flex flex-col bg-card/80">
                            <CardContent className="p-6 flex-1">
                                <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                                <p className="text-primary-foreground/80">{feature.description}</p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0 flex justify-between items-center text-muted-foreground">
                              
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
        
        {/* Legal Pathway Section */}
        <section id="legal-pathway" className="py-20">
          <div className="container mx-auto w-full max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-primary text-primary-foreground rounded-full p-3 mb-4">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h2 className="font-headline text-4xl font-bold mb-4">Navigate Your Startup's Legal Journey</h2>
                <p className="text-xl text-muted-foreground mb-6">
                  Get a personalized, step-by-step legal roadmap for your startup. Our AI provides clear guidance on everything from registration to compliance, tailored to your business in India.
                </p>
                <Button asChild size="lg">
                  <Link href="/dashboard/legal-pathways">
                    Explore Legal Pathways <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-lg">
                <h4 className="font-semibold text-lg mb-4">Key stages covered:</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Foundational Stage (Registration, IP)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Growth Stage (Hiring, Data Privacy)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Scaling Stage (Fundraising, Expansion)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

// A helper component for the list items in the new section
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
