// ============================================
// Database Types (matches Supabase schema)
// ============================================

export type ExperienceLevel = 'entry' | 'mid' | 'senior';
export type InterviewType = 'technical' | 'behavioral' | 'mixed';
export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned';
export type MessageRole = 'user' | 'assistant';

// ============================================
// Table Row Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  target_role: string;
  experience_level: ExperienceLevel;
  interviews_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  role: string;
  interview_type: InterviewType;
  duration_minutes: number;
  status: InterviewStatus;
  started_at: string;
  completed_at: string | null;
  recording_url: string | null;
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  audio_duration_seconds: number | null;
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  overall_score: number;
  technical_depth_score: number;
  communication_score: number;
  structure_score: number;
  confidence_score: number;
  strengths: string;
  improvements: string;
  detailed_feedback: DetailedFeedback;
  created_at: string;
}

// ============================================
// Nested / JSON Types
// ============================================

export interface DetailedFeedback {
  questions: QuestionFeedback[];
}

export interface QuestionFeedback {
  question: string;
  answer_quality: 'excellent' | 'good' | 'average' | 'poor';
  score: number;
  feedback: string;
}

// ============================================
// Supabase Database Type Map
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>;
      };
      interview_sessions: {
        Row: InterviewSession;
        Insert: Omit<InterviewSession, 'id' | 'created_at' | 'completed_at' | 'recording_url'> & {
          id?: string;
          completed_at?: string | null;
          recording_url?: string | null;
        };
        Update: Partial<Omit<InterviewSession, 'id' | 'user_id' | 'created_at'>>;
      };
      interview_messages: {
        Row: InterviewMessage;
        Insert: Omit<InterviewMessage, 'id' | 'timestamp' | 'audio_duration_seconds'> & {
          id?: string;
          timestamp?: string;
          audio_duration_seconds?: number | null;
        };
        Update: Partial<Omit<InterviewMessage, 'id' | 'session_id'>>;
      };
      interview_feedback: {
        Row: InterviewFeedback;
        Insert: Omit<InterviewFeedback, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<InterviewFeedback, 'id' | 'session_id' | 'created_at'>>;
      };
    };
  };
}
