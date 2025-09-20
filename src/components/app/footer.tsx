import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t">
       {/* Call to Action */}
       <div className="py-12 bg-accent/20">
        <div className="container mx-auto w-full max-w-4xl px-4 text-center">
            <div className="space-y-6">
                <h2 className="font-headline text-4xl font-bold text-secondary">Ready to Dive In?</h2>
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
        </div>
       </div>
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Legal Lens. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
