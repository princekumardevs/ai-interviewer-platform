'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mic,
  Clock,
  TrendingUp,
  Zap,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

interface SessionFeedback {
  overallScore: number;
  technicalDepthScore: number;
  communicationScore: number;
  structureScore: number;
  confidenceScore: number;
}

interface InterviewSession {
  id: string;
  role: string;
  interviewType: string;
  durationMinutes: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  feedback: SessionFeedback | null;
  _count: { messages: number };
}

interface Stats {
  total: number;
  completed: number;
  avgScore: number | null;
}

function getScoreColor(score: number) {
  if (score >= 76) return 'text-green-600';
  if (score >= 51) return 'text-yellow-600';
  if (score >= 26) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBadge(score: number) {
  if (score >= 76) return 'bg-green-100 text-green-700';
  if (score >= 51) return 'bg-yellow-100 text-yellow-700';
  if (score >= 26) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(startedAt: string, completedAt: string | null) {
  if (!completedAt) return '—';
  const diff = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  return `${mins} min`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/interviews');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
          setStats(data.stats);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (!user) return null;

  const totalCredits = 100;
  const creditsUsed = totalCredits - user.interviewsRemaining;
  const creditsPercent = (user.interviewsRemaining / totalCredits) * 100;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ready to ace your next interview? Let&apos;s practice.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Remaining
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.interviewsRemaining}
            </div>
            <Progress value={creditsPercent} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {creditsUsed} of {totalCredits} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Target Role</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {user.targetRole || 'Not set'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {user.experienceLevel} level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Sessions Completed
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.completed ?? 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats?.total === 0
                    ? 'Complete your first session!'
                    : `${stats?.total} total sessions`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    stats?.avgScore ? getScoreColor(stats.avgScore) : ''
                  }`}
                >
                  {stats?.avgScore ?? '—'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats?.avgScore ? 'out of 100' : 'No feedback yet'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <CardTitle>Start a Practice Interview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Practice makes perfect. Start a new AI-powered mock interview
              tailored to your target role and experience level.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">{user.targetRole}</Badge>
              <Badge variant="outline">{user.experienceLevel}</Badge>
            </div>
          </div>
          <Link href="/interview/new">
            <Button size="lg" className="gap-2">
              <Mic className="h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent interviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Interviews</CardTitle>
          {sessions.length > 5 && (
            <span className="text-sm text-muted-foreground">
              Showing latest 5
            </span>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium">No interviews yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your interview history will appear here after your first
                session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  href={
                    s.status === 'completed'
                      ? `/history/${s.id}`
                      : `/interview/${s.id}`
                  }
                >
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{s.role}</span>
                        <Badge
                          variant="outline"
                          className="shrink-0 capitalize"
                        >
                          {s.interviewType}
                        </Badge>
                        <Badge
                          variant={
                            s.status === 'completed'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="shrink-0 capitalize"
                        >
                          {s.status === 'in_progress'
                            ? 'In Progress'
                            : s.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(s.createdAt)}</span>
                        <span>&middot;</span>
                        <span>{s.durationMinutes} min</span>
                        <span>&middot;</span>
                        <span>
                          {formatDuration(s.startedAt, s.completedAt)}
                        </span>
                        <span>&middot;</span>
                        <span>{s._count.messages} messages</span>
                      </div>
                    </div>
                    {s.feedback && (
                      <div
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${getScoreBadge(
                          s.feedback.overallScore
                        )}`}
                      >
                        {s.feedback.overallScore}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
