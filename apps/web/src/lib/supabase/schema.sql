-- SOVEREIGN_EMPIRE_DATABASE_SCHEMA_V1.0
-- This script initializes the core data structures for a high-fidelity technological empire.

-- 1. PROFILES & ACCESS Tiers
DO $$ BEGIN
    CREATE TYPE user_tier AS ENUM ('GUEST', 'ELITE', 'SOVEREIGN', 'EMPIRE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tier user_tier DEFAULT 'GUEST',
  sovereign_credits BIGINT DEFAULT 0,
  neural_link_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. IMPERIAL SECTORS (Dynamic Status)
CREATE TABLE IF NOT EXISTS public.imperial_sectors (
  id TEXT PRIMARY KEY, -- e.g., 'vault', 'command'
  name TEXT NOT NULL,
  status TEXT DEFAULT 'NOMINAL', -- 'NOMINAL', 'ALERT', 'CRITICAL', 'EVOLVING'
  capacity INTEGER DEFAULT 100,
  power_draw FLOAT DEFAULT 0.0,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. SYSTEM LOGS (Live Feed)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id BIGSERIAL PRIMARY KEY,
  sector_id TEXT REFERENCES public.imperial_sectors(id),
  event_type TEXT NOT NULL, -- 'INFO', 'SECURITY', 'DATA_STREAM'
  message TEXT NOT NULL,
  origin_node TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INITIAL DATA SEED
INSERT INTO public.imperial_sectors (id, name, status, capacity, power_draw) VALUES
('vault', 'The Vault', 'NOMINAL', 100, 1.25),
('command', 'Global Command', 'NOMINAL', 85, 4.8),
('nexus', 'Neural Nexus', 'EVOLVING', 92, 12.4),
('bio', 'Bio-Sentinel', 'NOMINAL', 100, 0.8),
('projects', 'Imperial Projects', 'NOMINAL', 100, 2.1),
('council', 'High Council', 'NOMINAL', 100, 0.5),
('shadow', 'Shadow Sentinel', 'ALERT', 74, 8.9),
('fleet', 'The Fleet', 'NOMINAL', 100, 6.7),
('mint', 'The Mint', 'NOMINAL', 100, 3.4),
('citadel', 'The Citadel', 'NOMINAL', 100, 1.1),
('academy', 'The Academy', 'NOMINAL', 100, 0.9),
('forge', 'The Forge', 'NOMINAL', 100, 15.6),
('observatory', 'The Observatory', 'NOMINAL', 100, 2.3),
('greenhouse', 'The Greenhouse', 'NOMINAL', 100, 0.4),
('agora', 'The Agora', 'NOMINAL', 100, 0.7)
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES (Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.imperial_sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sectors are viewable by everyone" ON public.imperial_sectors FOR SELECT USING (true);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs are viewable by everyone" ON public.system_logs FOR SELECT USING (true);
