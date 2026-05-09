-- =====================================================
-- THE SOVEREIGN / NEYDRA — UNIFIED MASTER SCHEMA
-- Consolidated from 16 source files. Single source of truth.
-- Run sections as needed in Supabase SQL Editor.
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_tier AS ENUM ('GUEST', 'ELITE', 'SOVEREIGN', 'EMPIRE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('GUEST', 'ELITE', 'SOVEREIGN', 'EMPIRE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activation_status AS ENUM ('pending', 'processing', 'active', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SECTION 2: CORE TABLES
-- =====================================================

-- 2.1 PROFILES (merged from schema.sql + 001_initial_schema.sql)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tier user_tier DEFAULT 'GUEST',
  sovereign_credits BIGINT DEFAULT 0,
  neural_link_id TEXT UNIQUE,
  -- Legacy Neydra/LemonSqueezy columns (kept for compatibility)
  subscription_tier TEXT DEFAULT 'free',
  lemon_squeezy_customer_id TEXT,
  lemon_squeezy_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2.2 IMPERIAL SECTORS (from schema.sql)
CREATE TABLE IF NOT EXISTS public.imperial_sectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'NOMINAL',
  capacity INTEGER DEFAULT 100,
  power_draw FLOAT DEFAULT 0.0,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.imperial_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sectors are viewable by everyone" ON public.imperial_sectors;
CREATE POLICY "Sectors are viewable by everyone" ON public.imperial_sectors FOR SELECT USING (true);

-- 2.3 SYSTEM LOGS (from schema.sql)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id BIGSERIAL PRIMARY KEY,
  sector_id TEXT REFERENCES public.imperial_sectors(id),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  origin_node TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Logs are viewable by everyone" ON public.system_logs;
CREATE POLICY "Logs are viewable by everyone" ON public.system_logs FOR SELECT USING (true);

-- 2.4 USER SETTINGS (from 001_initial_schema.sql)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'fr')),
  email_digest TEXT DEFAULT 'daily' CHECK (email_digest IN ('none', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- 2.5 NEWS CACHE (from 001_initial_schema.sql)
CREATE TABLE IF NOT EXISTS public.news_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  reliability_score INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_cache_published ON public.news_cache(published_at DESC);

-- 2.6 PROCESSED WEBHOOKS (from identity_upgrade.sql)
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_name TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 USERS mapping table (from unification_fix.sql)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: SUBSCRIPTION SYSTEM (from 002_subscriptions_schema.sql)
-- =====================================================

-- 3.1 USER SUBSCRIPTIONS (full version)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'GUEST',
    status subscription_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    payment_provider TEXT,
    payment_id TEXT,
    payment_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, status) WHERE status = 'active'
);

-- 3.2 SUBSCRIPTION HISTORY
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    tier subscription_tier NOT NULL,
    status subscription_status NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 CRYPTO INTELLIGENCE
CREATE TABLE IF NOT EXISTS crypto_intelligence (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    source TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    relevance_score DECIMAL(3,2),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_published_at ON crypto_intelligence(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_sentiment ON crypto_intelligence(sentiment);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_user_bookmarks ON crypto_intelligence(user_id, is_bookmarked) WHERE is_bookmarked = TRUE;

-- RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
CREATE POLICY "Users can view own subscription history" ON subscription_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can insert subscription history" ON subscription_history;
CREATE POLICY "Service role can insert subscription history" ON subscription_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view intelligence" ON crypto_intelligence;
CREATE POLICY "Authenticated users can view intelligence" ON crypto_intelligence FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Service role can manage intelligence" ON crypto_intelligence;
CREATE POLICY "Service role can manage intelligence" ON crypto_intelligence FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users can bookmark intelligence" ON crypto_intelligence;
CREATE POLICY "Users can bookmark intelligence" ON crypto_intelligence FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SECTION 4: SOCIAL & COMMUNITY
-- =====================================================

-- 4.1 FORUMS (from community_schema.sql)
CREATE TABLE IF NOT EXISTS public.forums (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Globe',
  posts_count INTEGER DEFAULT 0,
  active_nodes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Forums are viewable by everyone" ON public.forums;
CREATE POLICY "Forums are viewable by everyone" ON public.forums FOR SELECT USING (true);

-- 4.2 POSTS (from community_schema.sql — with FK)
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

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (true);

-- 4.3 SOCIAL POSTS (from unification_fix.sql)
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('IMAGE', 'VIDEO', 'NONE')) DEFAULT 'NONE',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public social posts viewable" ON public.social_posts;
CREATE POLICY "Public social posts viewable" ON public.social_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create social posts" ON public.social_posts;
CREATE POLICY "Users can create social posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.4 SOCIAL STORIES (from unification_fix.sql + social_upgrade.sql)
CREATE TABLE IF NOT EXISTS public.social_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('IMAGE', 'VIDEO')) DEFAULT 'IMAGE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public stories viewable" ON public.social_stories;
CREATE POLICY "Public stories viewable" ON public.social_stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create stories" ON public.social_stories;
CREATE POLICY "Users can create stories" ON public.social_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own stories" ON public.social_stories;
CREATE POLICY "Users can delete own stories" ON public.social_stories FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete expired stories" ON public.social_stories;
CREATE POLICY "Allow delete expired stories" ON public.social_stories FOR DELETE USING (created_at < NOW() - INTERVAL '12 hours');

-- =====================================================
-- SECTION 5: VAULT, MISSIONS & SCOUTS (from expansion_engine.sql)
-- =====================================================

-- 5.1 SOVEREIGN VAULT
CREATE TABLE IF NOT EXISTS public.vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  item_type TEXT DEFAULT 'NOTE',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own vault items" ON public.vault_items;
CREATE POLICY "Users can only access their own vault items" ON public.vault_items FOR ALL USING (auth.uid() = user_id);

-- 5.2 MISSION CONTROL
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING',
  priority TEXT DEFAULT 'NORMAL',
  credits_reward INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own missions" ON public.missions;
CREATE POLICY "Users can manage their own missions" ON public.missions FOR ALL USING (auth.uid() = user_id);

-- 5.3 DIGITAL SCOUTS (full version with metadata + is_read)
CREATE TABLE IF NOT EXISTS public.scout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  scout_type TEXT NOT NULL,
  content TEXT NOT NULL,
  intel_level TEXT DEFAULT 'INFO',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their intelligence reports" ON public.scout_reports;
CREATE POLICY "Users can view their intelligence reports" ON public.scout_reports FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 6: ARMORY (from armory_engine.sql)
-- =====================================================

-- 6.1 WALLETS
CREATE TABLE IF NOT EXISTS public.armory_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'SOLANA',
  label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.armory_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own wallets" ON public.armory_wallets;
CREATE POLICY "Users manage their own wallets" ON public.armory_wallets FOR ALL USING (auth.uid() = user_id);

-- 6.2 EXECUTIONS
CREATE TABLE IF NOT EXISTS public.armory_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.armory_wallets ON DELETE SET NULL,
  transaction_hash TEXT,
  side TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'PENDING',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.armory_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own executions" ON public.armory_executions;
CREATE POLICY "Users view their own executions" ON public.armory_executions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 7: CHRONOS (from chronos_engine.sql — full version)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chronos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT DEFAULT 'OPERATION',
  is_ai_optimized BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chronos_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own schedule" ON public.chronos_events;
CREATE POLICY "Users manage their own schedule" ON public.chronos_events FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 8: CITADEL (from citadel_engine.sql)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.citadel_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_extension TEXT,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  encryption_version TEXT DEFAULT 'IMPERIAL_V4',
  file_type TEXT DEFAULT 'DOCUMENT',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.citadel_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access their own citadel files" ON public.citadel_files;
CREATE POLICY "Users access their own citadel files" ON public.citadel_files FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 9: NEXUS (from nexus_engine.sql)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.nexus_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.nexus_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.nexus_channels ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  encrypted_body TEXT NOT NULL,
  message_type TEXT DEFAULT 'TEXT',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_burned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.nexus_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own channels" ON public.nexus_channels;
CREATE POLICY "Users can manage their own channels" ON public.nexus_channels FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.nexus_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only read messages in their channels" ON public.nexus_messages;
CREATE POLICY "Users can only read messages in their channels" ON public.nexus_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.nexus_channels WHERE id = channel_id AND user_id = auth.uid()));

-- =====================================================
-- SECTION 10: SUPREMACY (from supremacy_engine.sql)
-- =====================================================

-- 10.1 AI AGENTS
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_protocol TEXT NOT NULL,
  status TEXT DEFAULT 'INACTIVE',
  config JSONB DEFAULT '{}'::jsonb,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own agents" ON public.ai_agents;
CREATE POLICY "Users manage their own agents" ON public.ai_agents FOR ALL USING (auth.uid() = user_id);

-- 10.2 AGENT EXECUTIONS
CREATE TABLE IF NOT EXISTS public.agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  output TEXT,
  resource_usage INTEGER DEFAULT 5,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.3 NEURAL BRIEFINGS (full version with UNIQUE constraint)
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

ALTER TABLE public.neural_briefings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own briefings" ON public.neural_briefings;
CREATE POLICY "Users view their own briefings" ON public.neural_briefings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 11: WEALTH & OPS (from unification_fix.sql)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    asset_symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    entry_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own portfolios" ON public.user_portfolios;
CREATE POLICY "Users manage own portfolios" ON public.user_portfolios FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'ACCEPTED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 12: USSD ACTIVATION (from 003 + 004)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users_activation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_code TEXT NOT NULL CHECK (pin_code ~ '^\d{14}$'),
    status activation_status NOT NULL DEFAULT 'pending',
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_activation_user_id ON public.users_activation(user_id);
CREATE INDEX IF NOT EXISTS idx_users_activation_status ON public.users_activation(status);
CREATE INDEX IF NOT EXISTS idx_users_activation_pending ON public.users_activation(created_at ASC) WHERE status = 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_activation_one_pending_per_user ON public.users_activation(user_id) WHERE status IN ('pending', 'processing');

ALTER TABLE public.users_activation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own activation" ON public.users_activation;
CREATE POLICY "Users can insert own activation" ON public.users_activation FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own activation" ON public.users_activation;
CREATE POLICY "Users can view own activation" ON public.users_activation FOR SELECT USING (auth.uid() = user_id);

-- Activation admin view
CREATE OR REPLACE VIEW public.activation_logs AS
SELECT
    a.id AS activation_id, a.user_id, p.full_name AS user_name, p.email AS user_email,
    a.pin_code, a.status, a.failure_reason, a.created_at AS submitted_at, a.processed_at,
    CASE WHEN a.processed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (a.processed_at - a.created_at))::INTEGER ELSE NULL END AS processing_seconds
FROM public.users_activation a
LEFT JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;

GRANT SELECT ON public.activation_logs TO service_role;

-- Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users_activation;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.users_activation TO authenticated;
GRANT ALL ON public.users_activation TO service_role;

-- =====================================================
-- SECTION 13: ALL FUNCTIONS
-- =====================================================

-- 13.1 Handle new user signup (from identity_upgrade.sql — correct version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, tier)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'GUEST');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13.2 Handle Lemon Squeezy webhooks (from identity_upgrade.sql)
CREATE OR REPLACE FUNCTION public.handle_ls_webhook(p_event_id TEXT, p_user_id UUID, p_tier user_tier, p_ls_sub_id TEXT, p_event_name TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.processed_webhooks (event_id, event_name) VALUES (p_event_id, p_event_name) ON CONFLICT (event_id) DO NOTHING;
  UPDATE public.profiles SET tier = p_tier, updated_at = now() WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.3 Complete mission and reward credits (from expansion_engine.sql)
CREATE OR REPLACE FUNCTION public.complete_mission(p_mission_id UUID)
RETURNS void AS $$
DECLARE v_user_id UUID; v_reward INTEGER;
BEGIN
  SELECT user_id, credits_reward INTO v_user_id, v_reward FROM public.missions WHERE id = p_mission_id AND status != 'COMPLETED';
  IF FOUND THEN
    UPDATE public.missions SET status = 'COMPLETED', completed_at = now() WHERE id = p_mission_id;
    UPDATE public.profiles SET sovereign_credits = sovereign_credits + v_reward, updated_at = now() WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.4 Get optimal scheduling slots (from chronos_engine.sql)
CREATE OR REPLACE FUNCTION public.get_optimal_slots(p_duration_minutes INTEGER)
RETURNS TABLE (suggested_start TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY SELECT now() + interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.5 Burn expired Nexus messages (from nexus_engine.sql)
CREATE OR REPLACE FUNCTION public.burn_expired_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.nexus_messages SET is_burned = true, encrypted_body = '[DATA_PURGED_BY_NEXUS_PROTOCOL]' WHERE expires_at IS NOT NULL AND expires_at < now() AND is_burned = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.6 Auto-update updated_at column (from 002)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_crypto_intelligence_updated_at ON crypto_intelligence;
CREATE TRIGGER update_crypto_intelligence_updated_at BEFORE UPDATE ON crypto_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13.7 Log subscription changes (from 002)
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
        VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, 'created', jsonb_build_object('payment_provider', NEW.payment_provider));
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.tier != NEW.tier THEN
            INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
            VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, CASE WHEN NEW.tier > OLD.tier THEN 'upgraded' ELSE 'downgraded' END, jsonb_build_object('old_tier', OLD.tier, 'new_tier', NEW.tier));
        END IF;
        IF OLD.status != NEW.status THEN
            INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
            VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, CASE WHEN NEW.status = 'cancelled' THEN 'cancelled' WHEN NEW.status = 'expired' THEN 'expired' ELSE 'status_changed' END, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_subscription_changes ON user_subscriptions;
CREATE TRIGGER log_subscription_changes AFTER INSERT OR UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION log_subscription_change();

-- 13.8 Get user tier (from 002)
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS subscription_tier AS $$
DECLARE v_tier subscription_tier;
BEGIN
    SELECT tier INTO v_tier FROM user_subscriptions WHERE user_id = p_user_id AND status = 'active' ORDER BY created_at DESC LIMIT 1;
    RETURN COALESCE(v_tier, 'GUEST');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.9 Check feature access (from 002)
CREATE OR REPLACE FUNCTION has_feature_access(p_user_id UUID, p_required_tier subscription_tier)
RETURNS BOOLEAN AS $$
DECLARE v_user_tier subscription_tier;
BEGIN
    v_user_tier := get_user_tier(p_user_id);
    RETURN CASE v_user_tier
        WHEN 'EMPIRE' THEN TRUE
        WHEN 'SOVEREIGN' THEN p_required_tier IN ('GUEST', 'ELITE', 'SOVEREIGN')
        WHEN 'ELITE' THEN p_required_tier IN ('GUEST', 'ELITE')
        WHEN 'GUEST' THEN p_required_tier = 'GUEST'
        ELSE FALSE END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13.10 Fetch pending activation with user identity (from 004 — latest)
CREATE OR REPLACE FUNCTION public.fetch_pending_activation()
RETURNS TABLE (activation_id UUID, activation_user_id UUID, activation_pin_code TEXT, activation_user_name TEXT, activation_user_email TEXT) AS $$
BEGIN
    RETURN QUERY
    WITH next_task AS (
        SELECT ua.id, ua.user_id, ua.pin_code FROM public.users_activation ua WHERE ua.status = 'pending' ORDER BY ua.created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED
    )
    UPDATE public.users_activation a SET status = 'processing', processed_at = NOW()
    FROM next_task LEFT JOIN public.profiles p ON p.id = next_task.user_id
    WHERE a.id = next_task.id
    RETURNING a.id AS activation_id, a.user_id AS activation_user_id, a.pin_code AS activation_pin_code, p.full_name AS activation_user_name, p.email AS activation_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fetch_pending_activation() TO service_role;

-- =====================================================
-- END OF SOVEREIGN MASTER SCHEMA
-- =====================================================
