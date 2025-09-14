import { Logo } from "./logo";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
         <div className="flex items-center gap-4">
            <Button asChild size="sm" variant="ghost">
              <Link href="#features">
                Features
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
