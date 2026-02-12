-- ============================================
-- AI Mock Interviewer Platform
-- Initial Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  target_role TEXT NOT NULL DEFAULT 'Software Engineer',
  experience_level TEXT NOT NULL DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior')),
  interviews_remaining INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- INTERVIEW SESSIONS TABLE
-- ============================================
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Software Engineer',
  interview_type TEXT NOT NULL DEFAULT 'technical' CHECK (interview_type IN ('technical', 'behavioral', 'mixed')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(status);

-- ============================================
-- INTERVIEW MESSAGES TABLE
-- ============================================
CREATE TABLE public.interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audio_duration_seconds FLOAT
);

CREATE INDEX idx_interview_messages_session_id ON public.interview_messages(session_id);

-- ============================================
-- INTERVIEW FEEDBACK TABLE
-- ============================================
CREATE TABLE public.interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL UNIQUE REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 100),
  technical_depth_score INTEGER CHECK (technical_depth_score BETWEEN 1 AND 100),
  communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 100),
  structure_score INTEGER CHECK (structure_score BETWEEN 1 AND 100),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 100),
  strengths TEXT,
  improvements TEXT,
  detailed_feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_feedback_session_id ON public.interview_feedback(session_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: users can only read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Interview Sessions: users can only access their own sessions
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Interview Messages: users can only access messages from their sessions
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.interview_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE interview_sessions.id = interview_messages.session_id
      AND interview_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON public.interview_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE interview_sessions.id = interview_messages.session_id
      AND interview_sessions.user_id = auth.uid()
    )
  );

-- Interview Feedback: users can only view feedback for their sessions
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.interview_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE interview_sessions.id = interview_feedback.session_id
      AND interview_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback for own sessions"
  ON public.interview_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE interview_sessions.id = interview_feedback.session_id
      AND interview_sessions.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKET FOR RECORDINGS
-- ============================================
-- Run this in Supabase dashboard SQL editor or via Storage API:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('recordings', 'recordings', false);
