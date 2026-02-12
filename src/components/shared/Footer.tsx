import Link from 'next/link';
import { Mic } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              InterviewAI &copy; {new Date().getFullYear()}
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
