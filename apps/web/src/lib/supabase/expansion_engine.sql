-- IMPERIAL_EXPANSION_PHASE_5_SCHEMA
-- This script initializes the real data engines for Vault, Missions, and Scouts.

-- 1. SOVEREIGN VAULT ENGINE
CREATE TABLE IF NOT EXISTS public.vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL, -- Client-side encrypted content
  item_type TEXT DEFAULT 'NOTE', -- 'NOTE', 'CREDENTIAL', 'KEY'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Vault
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own vault items" ON public.vault_items
  FOR ALL USING (auth.uid() = user_id);

-- 2. MISSION CONTROL ENGINE
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED'
  priority TEXT DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'CRITICAL'
  credits_reward INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS for Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own missions" ON public.missions
  FOR ALL USING (auth.uid() = user_id);

-- 3. DIGITAL SCOUTS INTEL ENGINE
CREATE TABLE IF NOT EXISTS public.scout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  scout_type TEXT NOT NULL, -- 'MARKET', 'NEWS', 'SECURITY', 'SYSTEM'
  content TEXT NOT NULL,
  intel_level TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Scouts
ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their intelligence reports" ON public.scout_reports
  FOR ALL USING (auth.uid() = user_id);

-- 4. FUNCTION TO COMPLETE MISSION AND REWARD CREDITS
CREATE OR REPLACE FUNCTION public.complete_mission(p_mission_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_reward INTEGER;
BEGIN
  -- Check mission status and get user/reward
  SELECT user_id, credits_reward INTO v_user_id, v_reward
  FROM public.missions
  WHERE id = p_mission_id AND status != 'COMPLETED';

  IF FOUND THEN
    -- Update Mission
    UPDATE public.missions
    SET status = 'COMPLETED',
        completed_at = now()
    WHERE id = p_mission_id;

    -- Reward User Credits in Profile
    UPDATE public.profiles
    SET sovereign_credits = sovereign_credits + v_reward,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
