'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Mic } from 'lucide-react';

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Mic className="h-6 w-6 text-primary" />
          <span>InterviewAI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          {isLoading ? null : user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-6 mt-8">
              <Link
                href="/#features"
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                How It Works
              </Link>
              {isLoading ? null : user ? (
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="outline" asChild onClick={() => setOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
