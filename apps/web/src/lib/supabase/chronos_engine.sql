-- CHRONOS_ENGINE: AI_TIME_GOVERNANCE_SCHEMA
-- This schema handles AI-optimized scheduling and time management.

CREATE TABLE IF NOT EXISTS public.chronos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT DEFAULT 'OPERATION', -- 'OPERATION', 'REST', 'MISSION', 'STRATEGIC'
  is_ai_optimized BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Chronos
ALTER TABLE public.chronos_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own schedule" ON public.chronos_events
  FOR ALL USING (auth.uid() = user_id);

-- Function to suggest optimal slots (Placeholder for AI logic)
CREATE OR REPLACE FUNCTION public.get_optimal_slots(p_duration_minutes INTEGER)
RETURNS TABLE (suggested_start TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  -- Logic would go here to finding gaps in chronos_events
  RETURN QUERY SELECT now() + interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
