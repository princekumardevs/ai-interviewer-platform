'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInterviewStore, type Message } from '@/stores/interviewStore';
import {
  Send,
  Loader2,
  StopCircle,
  Clock,
  User,
  Bot,
  AlertCircle,
} from 'lucide-react';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.id as string;

  const {
    status,
    messages,
    isAiThinking,
    error,
    timeRemaining,
    role,
    interviewType,
    setSession,
    setStatus,
    addMessage,
    setAiThinking,
    setError,
    setStartedAt,
    setTimeRemaining,
    reset,
  } = useInterviewStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Start the interview on mount
  useEffect(() => {
    if (!sessionId) return;

    async function initInterview() {
      setStatus('starting');
      setError(null);

      try {
        // Fetch session details
        const sessionRes = await fetch(`/api/interviews/${sessionId}`);
        if (!sessionRes.ok) {
          throw new Error('Failed to load interview session');
        }
        const sessionData = await sessionRes.json();

        setSession({
          sessionId,
          role: sessionData.role,
          interviewType: sessionData.interviewType,
          durationMinutes: sessionData.durationMinutes,
        });

        // If session already has messages (resuming), load them
        if (sessionData.messages && sessionData.messages.length > 0) {
          sessionData.messages.forEach((msg: Message) => {
            // Skip the "[Interview Started]" system message
            if (msg.content !== '[Interview Started]') {
              addMessage(msg);
            }
          });
          setStatus('in_progress');
          setStartedAt(sessionData.startedAt);
          return;
        }

        // Start new interview — get AI's opening message
        setAiThinking(true);
        const startRes = await fetch(`/api/interviews/${sessionId}/start`, {
          method: 'POST',
        });

        if (!startRes.ok) {
          throw new Error('Failed to start interview');
        }

        const startData = await startRes.json();
        addMessage({
          role: 'assistant',
          content: startData.content,
          timestamp: new Date().toISOString(),
        });

        setStatus('in_progress');
        setStartedAt(new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('idle');
      } finally {
        setAiThinking(false);
      }
    }

    initInterview();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'in_progress') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeRemaining, setTimeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isAiThinking || status !== 'in_progress') return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    setAiThinking(true);
    setError(null);

    try {
      const response = await fetch(`/api/interviews/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      addMessage({
        id: data.id,
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp,
      });
    } catch {
      setError('Failed to get response. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setAiThinking(false);
      textareaRef.current?.focus();
    }
  }, [input, isAiThinking, status, sessionId, addMessage, setAiThinking, setError, toast]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // End interview
  async function handleEndInterview() {
    setStatus('ending');
    try {
      const res = await fetch(`/api/interviews/${sessionId}/end`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to end interview');

      setStatus('completed');
      toast({
        title: 'Interview Completed',
        description: 'Your interview has been saved.',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        reset();
        router.push('/dashboard');
      }, 2000);
    } catch {
      setStatus('in_progress');
      toast({
        title: 'Error',
        description: 'Failed to end interview',
        variant: 'destructive',
      });
    }
  }

  // Loading state
  if (status === 'starting') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Starting Interview...</h2>
          <p className="text-sm text-muted-foreground">
            Your AI interviewer is preparing questions
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'idle' && error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to Start</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{role}</Badge>
          <Badge variant="outline" className="capitalize">
            {interviewType}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              timeRemaining <= 60
                ? 'bg-destructive/10 text-destructive'
                : timeRemaining <= 300
                ? 'bg-yellow-500/10 text-yellow-600'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeRemaining)}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndInterview}
            disabled={status === 'ending' || status === 'completed'}
          >
            {status === 'ending' ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <StopCircle className="mr-1 h-4 w-4" />
            )}
            End Interview
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* AI Thinking Indicator */}
        {isAiThinking && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completed Banner */}
      {status === 'completed' && (
        <div className="border-t bg-green-50 px-4 py-3 text-center text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Interview completed! Redirecting to dashboard...
        </div>
      )}

      {/* Input Area */}
      {status === 'in_progress' && (
        <div className="border-t p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[150px] resize-none"
              disabled={isAiThinking}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isAiThinking}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
            >
              {isAiThinking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-center text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
