'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="flex-1 container mx-auto w-full max-w-4xl px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="font-headline text-5xl font-bold tracking-tight">
            Welcome to Legal Lens
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered assistant for analyzing Terms of Service documents. Understand complex legal language in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Access Platform <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>

          <div className="flex justify-center gap-4 pt-8">
             <Card className="text-left w-64">
                <CardHeader>
                  <LogIn className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Existing user? Log in to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </CardContent>
             </Card>
             <Card className="text-left w-64">
                <CardHeader>
                  <UserPlus className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>New here? Create an account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
