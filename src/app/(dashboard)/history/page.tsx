'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Trophy,
  TrendingUp,
  ChevronRight,
  History,
  MessageSquare,
} from 'lucide-react';

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

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, completedAt: string | null) {
  if (!completedAt) return '—';
  const diff = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  return `${mins} min`;
}

export default function HistoryPage() {
  const router = useRouter();
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Interview History</h1>
        <p className="mt-1 text-muted-foreground">
          Review your past interviews and track your progress.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? <Skeleton className="h-7 w-8 inline-block" /> : stats?.total ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? <Skeleton className="h-7 w-8 inline-block" /> : stats?.completed ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats?.avgScore ? getScoreColor(stats.avgScore) : ''}`}>
                {loading ? (
                  <Skeleton className="h-7 w-8 inline-block" />
                ) : stats?.avgScore ? (
                  stats.avgScore
                ) : (
                  '—'
                )}
              </p>
              <p className="text-xs text-muted-foreground">Avg. Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium">No interviews yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Complete your first interview to see your history here.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/interview/new')}
              >
                Start Your First Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    router.push(
                      s.status === 'completed'
                        ? `/history/${s.id}`
                        : `/interview/${s.id}`
                    )
                  }
                  className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.role}</span>
                      <Badge
                        variant="outline"
                        className="shrink-0 capitalize"
                      >
                        {s.interviewType}
                      </Badge>
                      <Badge
                        variant={
                          s.status === 'completed' ? 'secondary' : 'destructive'
                        }
                        className="shrink-0 capitalize"
                      >
                        {s.status === 'in_progress' ? 'In Progress' : s.status}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatDate(s.createdAt)}</span>
                      <span>{formatTime(s.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(s.startedAt, s.completedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {s._count.messages} messages
                      </span>
                    </div>
                  </div>
                  {s.feedback && (
                    <div
                      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${getScoreBadge(
                        s.feedback.overallScore
                      )}`}
                    >
                      {s.feedback.overallScore}/100
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
