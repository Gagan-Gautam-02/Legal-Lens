import { Scale } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Legal Lens homepage">
      <Scale className="h-7 w-7 text-primary" />
      <span className="font-headline text-2xl font-bold">Legal Lens</span>
    </div>
  );
}
