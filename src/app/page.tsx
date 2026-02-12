import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import {
  Mic,
  Brain,
  BarChart3,
  Settings2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Real-Time Voice Conversations',
    description:
      'Practice with natural voice conversations. Speak freely and get real-time responses from the AI interviewer.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description:
      'Powered by advanced AI that asks contextual follow-up questions and adapts to your responses.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Feedback & Scoring',
    description:
      'Get comprehensive feedback with scores on technical depth, communication, structure, and confidence.',
  },
  {
    icon: Settings2,
    title: 'Fully Customizable',
    description:
      'Choose your target role, experience level, interview type, and duration for a tailored experience.',
  },
];

const steps = [
  {
    step: '1',
    title: 'Set Up Your Interview',
    description:
      'Choose your target role, interview type (technical or behavioral), and preferred duration.',
  },
  {
    step: '2',
    title: 'Talk to the AI Interviewer',
    description:
      'Have a natural voice conversation. The AI asks real interview questions and contextual follow-ups.',
  },
  {
    step: '3',
    title: 'Get Detailed Feedback',
    description:
      'Review your performance with detailed scores, strengths, areas for improvement, and actionable tips.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Free to try — 3 practice interviews included
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Ace Your Next Interview with{' '}
                <span className="text-primary">AI-Powered</span> Practice
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Practice real interviews through natural voice conversations with an AI
                interviewer. Get instant feedback, improve your skills, and land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="text-base px-8">
                  <Link href="/signup">
                    Start Practicing Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link href="/#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
          {/* Gradient background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.08),transparent)]" />
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-20 md:py-24">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything You Need to Prepare
              </h2>
              <p className="text-muted-foreground text-lg">
                A complete interview practice platform designed to help you perform your best.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border bg-background">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t">
          <div className="container mx-auto px-4 py-20 md:py-24">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Get started in minutes. No scheduling, no pressure.
              </p>
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 md:grid-cols-3">
                {steps.map((item) => (
                  <div key={item.step} className="relative text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="mb-2 font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-20 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join now and start practicing with your AI interviewer. It&apos;s free to get started.
              </p>
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/signup">
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 h-4 w-4" />
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
