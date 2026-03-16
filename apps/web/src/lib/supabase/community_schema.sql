-- SQL Migration for Imperial Nexus Community
-- Run this in your Supabase SQL Editor

-- 1. FORUMS Table
CREATE TABLE IF NOT EXISTS public.forums (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Globe', -- Lucide icon name
  posts_count INTEGER DEFAULT 0,
  active_nodes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. POSTS Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id TEXT REFERENCES public.forums(id) ON DELETE CASCADE,
  author_email TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial Forum Data
INSERT INTO public.forums (id, label, icon_name, posts_count, active_nodes_count) VALUES
('alpha', 'STRATEGY_FORUM', 'TrendingUp', 124, 12),
('beta', 'TECH_Vortex', 'Hash', 89, 5),
('gamma', 'LIFESTYLE_NODE', 'Globe', 245, 42)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forums are viewable by everyone" ON public.forums FOR SELECT USING (true);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (true);
