'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogOut } from 'lucide-react';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href="/#features">Features</Link>
          </Button>
          {user ? (
            <Button onClick={handleSignOut} size="sm" variant="outline">
              Sign Out <LogOut className="ml-2" />
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
