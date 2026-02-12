'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const creditsUsed = 5 - user.interviewsRemaining;
  const creditsPercent = (user.interviewsRemaining / 5) * 100;

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
              {creditsUsed} of 5 used
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
            <div className="text-2xl font-bold">0</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Complete your first session!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="mt-1 text-xs text-muted-foreground">
              No sessions yet
            </p>
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

      {/* Recent interviews placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium">No interviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your interview history will appear here after your first session.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
