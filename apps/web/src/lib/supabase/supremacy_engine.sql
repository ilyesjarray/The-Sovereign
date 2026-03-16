-- IMPERIAL_SUPREMACY_PHASE_6_SCHEMA
-- Foundations for AI Agents and Daily Briefings.

-- 1. THE FORGE: AI AGENTS ENGINE
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_protocol TEXT NOT NULL, -- 'SCHEDULED', 'MARKET_EVENT', 'MANUAL'
  status TEXT DEFAULT 'INACTIVE', -- 'ACTIVE', 'INACTIVE', 'RUNNING'
  config JSONB DEFAULT '{}'::jsonb,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Agents
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own agents" ON public.ai_agents
  FOR ALL USING (auth.uid() = user_id);

-- 2. COMMAND LOGS (For Agent transparency)
CREATE TABLE IF NOT EXISTS public.agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL, -- 'SUCCESS', 'FAILURE'
  output TEXT,
  resource_usage INTEGER DEFAULT 5, -- Energy/Credit consumption
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. NEURAL BRIEFING LOGS (Synthesis storage)
CREATE TABLE IF NOT EXISTS public.neural_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  briefing_date DATE DEFAULT CURRENT_DATE NOT NULL,
  intel_summary TEXT NOT NULL,
  strategic_advice TEXT,
  wealth_snapshot JSONB,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, briefing_date)
);

-- RLS for Briefings
ALTER TABLE public.neural_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own briefings" ON public.neural_briefings
  FOR ALL USING (auth.uid() = user_id);
