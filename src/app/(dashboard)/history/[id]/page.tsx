'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Bot,
  User,
  Download,
  Clock,
  Trophy,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SessionData {
  id: string;
  role: string;
  interviewType: string;
  durationMinutes: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  messages: Message[];
  feedback: {
    overallScore: number;
  } | null;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

function getScoreColor(score: number) {
  if (score >= 76) return 'text-green-600';
  if (score >= 51) return 'text-yellow-600';
  if (score >= 26) return 'text-orange-500';
  return 'text-red-500';
}

export default function TranscriptPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/interviews/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const handleDownload = () => {
    if (!session) return;

    const transcript = session.messages
      .filter((m) => m.content !== '[Interview Started]')
      .map((m) => {
        const role = m.role === 'assistant' ? 'AI Interviewer' : 'Candidate';
        return `${role}:\n${m.content}\n`;
      })
      .join('\n---\n\n');

    const header = [
      `Interview Transcript`,
      `Role: ${session.role}`,
      `Type: ${session.interviewType}`,
      `Date: ${formatDateTime(session.startedAt)}`,
      `Duration: ${formatDuration(session.startedAt, session.completedAt)}`,
      session.feedback ? `Score: ${session.feedback.overallScore}/100` : '',
      '',
      '='.repeat(50),
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([header + transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${session.role.toLowerCase().replace(/\s+/g, '-')}-${
      new Date(session.startedAt).toISOString().split('T')[0]
    }.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Interview not found</p>
          <Button className="mt-4" onClick={() => router.push('/history')}>
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const chatMessages = session.messages.filter(
    (m) => m.content !== '[Interview Started]'
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/history')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Interview Transcript</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{session.role}</Badge>
              <Badge variant="outline" className="capitalize">
                {session.interviewType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(session.startedAt)}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {formatDuration(session.startedAt, session.completedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {chatMessages.length} messages
        </span>
        {session.feedback && (
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className={`font-semibold ${getScoreColor(session.feedback.overallScore)}`}>
              {session.feedback.overallScore}/100
            </span>
          </span>
        )}
        {session.feedback && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => router.push(`/interview/${sessionId}/feedback`)}
          >
            View Feedback
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {chatMessages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'assistant'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.role === 'user'
                      ? 'text-primary-foreground/60'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
