'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Brain,
  MessageSquare,
  ListOrdered,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface DetailedQuestion {
  question: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  suggestion: string;
}

interface FeedbackData {
  overallScore: number;
  technicalDepthScore: number;
  communicationScore: number;
  structureScore: number;
  confidenceScore: number;
  strengths: string;
  improvements: string;
  detailedFeedback: DetailedQuestion[];
}

interface SessionData {
  id: string;
  role: string;
  interviewType: string;
  durationMinutes: number;
  status: string;
  startedAt: string;
  completedAt: string;
  feedback: FeedbackData | null;
}

function getScoreColor(score: number) {
  if (score >= 76) return 'text-green-600';
  if (score >= 51) return 'text-yellow-600';
  if (score >= 26) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreLabel(score: number) {
  if (score >= 76) return 'Excellent';
  if (score >= 51) return 'Good';
  if (score >= 26) return 'Needs Improvement';
  return 'Poor';
}

function getProgressColor(score: number) {
  if (score >= 76) return '[&>div]:bg-green-500';
  if (score >= 51) return '[&>div]:bg-yellow-500';
  if (score >= 26) return '[&>div]:bg-orange-500';
  return '[&>div]:bg-red-500';
}

function ScoreCard({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <Progress
            value={score}
            className={`h-1.5 ${getProgressColor(score)}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch(`/api/interviews/${sessionId}`);
        if (!res.ok) throw new Error('Failed to load feedback');
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            {error || 'Session not found'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const feedback = session.feedback;

  if (!feedback) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-lg font-semibold">
              Feedback is being generated...
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a moment. Please refresh the page shortly.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const strengths = feedback.strengths
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  const improvements = feedback.improvements
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  const detailedQuestions = Array.isArray(feedback.detailedFeedback)
    ? (feedback.detailedFeedback as DetailedQuestion[])
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Interview Feedback</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{session.role}</Badge>
            <Badge variant="outline" className="capitalize">
              {session.interviewType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(session.completedAt).toLocaleDateString()} &middot;{' '}
              {session.durationMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <Trophy className="h-10 w-10 text-primary" />
          <h2 className="text-lg font-semibold text-muted-foreground">
            Overall Score
          </h2>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-6xl font-extrabold ${getScoreColor(
                feedback.overallScore
              )}`}
            >
              {feedback.overallScore}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Badge
            variant="secondary"
            className={`text-sm ${getScoreColor(feedback.overallScore)}`}
          >
            {getScoreLabel(feedback.overallScore)}
          </Badge>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Score Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ScoreCard
            label="Technical Depth"
            score={feedback.technicalDepthScore}
            icon={Brain}
          />
          <ScoreCard
            label="Communication"
            score={feedback.communicationScore}
            icon={MessageSquare}
          />
          <ScoreCard
            label="Structure"
            score={feedback.structureScore}
            icon={ListOrdered}
          />
          <ScoreCard
            label="Confidence"
            score={feedback.confidenceScore}
            icon={Shield}
          />
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <TrendingDown className="h-5 w-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Per-Question Feedback */}
      {detailedQuestions.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Question-by-Question Breakdown
          </h3>
          <div className="space-y-4">
            {detailedQuestions.map((q, i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Question {i + 1}
                      </p>
                      <p className="mt-1 font-medium">{q.question}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-xl font-bold ${getScoreColor(
                          q.score
                        )}`}
                      >
                        {q.score}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /100
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your Answer: </span>
                      <span className="text-muted-foreground">
                        {q.candidateAnswer}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Feedback: </span>
                      <span>{q.feedback}</span>
                    </div>
                    <div className="rounded-md bg-primary/5 p-2">
                      <span className="font-medium text-primary">
                        💡 Suggestion:{' '}
                      </span>
                      <span>{q.suggestion}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 pb-8">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => router.push('/interview/new')}>
          Practice Again
        </Button>
      </div>
    </div>
  );
}
