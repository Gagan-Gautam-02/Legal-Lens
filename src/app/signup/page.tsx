
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { createUserWithEmailAndPassword, signInWithPopup, AuthError } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Account Created',
        description: "You've been successfully signed up!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try another email or log in.';
      }
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: 'Account Created',
        description: "You've been successfully signed up!",
      });
      router.push('/dashboard');
    } catch (error: any) {
       const authError = error as AuthError;
       console.error('Google Sign-in error:', authError);
       
       let message = 'Could not sign up with Google. Please try again.';
       
       if (authError.code === 'auth/operation-not-allowed') {
         message = 'Google Sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.';
       } else if (authError.code === 'auth/popup-blocked') {
         message = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
       } else if (authError.code === 'auth/unauthorized-domain') {
         const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
         message = `Domain "${currentDomain}" is not authorized. Please add "${currentDomain}" to "Authorized domains" in your Firebase Console > Authentication > Settings.`;
       }

       toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center p-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <Card className="w-full max-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Sign Up</CardTitle>
                  <CardDescription>
                    Create an account to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="firstName">First Name</Label>
                              <FormControl>
                                <Input id="firstName" placeholder="Max" {...field} disabled={isLoading || isGoogleLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="lastName">Last Name</Label>
                              <FormControl>
                                <Input id="lastName" placeholder="Robinson" {...field} disabled={isLoading || isGoogleLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="email">Email</Label>
                            <FormControl>
                              <Input id="email" type="email" placeholder="m@example.com" {...field} disabled={isLoading || isGoogleLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="phone">Phone Number</Label>
                            <FormControl>
                              <Input id="phone" type="tel" placeholder="+1 234 567 890" {...field} disabled={isLoading || isGoogleLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="password">Password</Label>
                            <FormControl>
                              <Input id="password" type="password" {...field} disabled={isLoading || isGoogleLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Create an account'}
                      </Button>
                    </form>
                  </Form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="animate-spin" /> : <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.25,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Sign Up with Google
                    </>}
                  </Button>

                  <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                      Login
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
             <div className="hidden md:flex justify-center items-center">
                <Image 
                    src="/SignupImg.png" 
                    alt="Illustration for user registration"
                    width={400} 
                    height={450} 
                    className="rounded-lg"
                />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
