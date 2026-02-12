import { create } from 'zustand';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface InterviewState {
  // Session info
  sessionId: string | null;
  role: string;
  interviewType: string;
  durationMinutes: number;
  status: 'idle' | 'starting' | 'in_progress' | 'ending' | 'completed';

  // Messages
  messages: Message[];

  // UI state
  isAiThinking: boolean;
  error: string | null;

  // Timer
  startedAt: string | null;
  timeRemaining: number; // seconds

  // Actions
  setSession: (data: {
    sessionId: string;
    role: string;
    interviewType: string;
    durationMinutes: number;
  }) => void;
  setStatus: (status: InterviewState['status']) => void;
  addMessage: (message: Message) => void;
  setAiThinking: (thinking: boolean) => void;
  setError: (error: string | null) => void;
  setStartedAt: (time: string) => void;
  setTimeRemaining: (seconds: number) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  role: '',
  interviewType: '',
  durationMinutes: 0,
  status: 'idle' as const,
  messages: [],
  isAiThinking: false,
  error: null,
  startedAt: null,
  timeRemaining: 0,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setSession: (data) =>
    set({
      sessionId: data.sessionId,
      role: data.role,
      interviewType: data.interviewType,
      durationMinutes: data.durationMinutes,
      timeRemaining: data.durationMinutes * 60,
    }),

  setStatus: (status) => set({ status }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setAiThinking: (thinking) => set({ isAiThinking: thinking }),

  setError: (error) => set({ error }),

  setStartedAt: (time) => set({ startedAt: time }),

  setTimeRemaining: (seconds) => set({ timeRemaining: Math.max(0, seconds) }),

  reset: () => set(initialState),
}));
