'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AVAILABLE_ROLES,
  INTERVIEW_TYPES,
  DURATION_OPTIONS,
} from '@/lib/constants/questionBank';
import { Mic, Clock, Briefcase, BarChart3, ArrowLeft, Loader2 } from 'lucide-react';

export default function NewInterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [role, setRole] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const canStart = role && interviewType && durationMinutes;

  async function handleStartInterview() {
    if (!canStart) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/interviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          interviewType,
          durationMinutes: parseInt(durationMinutes),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create interview');
      }

      const data = await response.json();
      router.push(`/interview/${data.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create interview',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">New Interview</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your mock interview session. You have{' '}
          <span className="font-semibold text-primary">
            {user?.interviewsRemaining ?? 0}
          </span>{' '}
          {(user?.interviewsRemaining ?? 0) === 1 ? 'credit' : 'credits'} remaining.
        </p>
      </div>

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Interview Setup
          </CardTitle>
          <CardDescription>
            Choose the role, type, and duration for your practice session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Target Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setInterviewType(type.value)}
                  className={`rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 ${
                    interviewType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDurationMinutes(String(opt.value))}
                  className={`rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 ${
                    durationMinutes === String(opt.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    {opt.label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Preview */}
      {canStart && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="font-semibold">Ready to start</div>
              <div className="text-sm text-muted-foreground">
                {role} · {INTERVIEW_TYPES.find((t) => t.value === interviewType)?.label} ·{' '}
                {durationMinutes} min
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleStartInterview}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Tips for a Great Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Find a quiet environment to minimize background noise</li>
            <li>• Speak clearly and at a natural pace</li>
            <li>• Structure your answers using the STAR method for behavioral questions</li>
            <li>• Take a moment to think before answering — it&apos;s okay to pause</li>
            <li>• Treat this like a real interview for the best practice</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
