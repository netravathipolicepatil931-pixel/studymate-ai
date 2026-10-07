-- ================================================
-- StudyMate AI Supabase Database Schema Setup
-- Run this script in your Supabase SQL Editor
-- ================================================

-- 1. Create Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'New Study Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL DEFAULT '',
    attached_file JSONB DEFAULT NULL,
    study_pack JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON public.study_sessions(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if re-running script to prevent duplicate errors
DROP POLICY IF EXISTS "Allow public read access to study_sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Allow public insert/update/delete access to study_sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Allow public read access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert/update/delete access to messages" ON public.messages;

-- 6. Re-create RLS Policies
CREATE POLICY "Allow public read access to study_sessions"
    ON public.study_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update/delete access to study_sessions"
    ON public.study_sessions FOR ALL USING (true);

CREATE POLICY "Allow public read access to messages"
    ON public.messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update/delete access to messages"
    ON public.messages FOR ALL USING (true);

-- ================================================
