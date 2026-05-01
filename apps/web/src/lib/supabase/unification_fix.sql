-- ==========================================
-- SOVEREIGN-NEYDRA UNIFICATION FIX v2
-- Resolves all remaining 404/400 errors and schema conflicts.
-- ==========================================

-- 1. PROFILES ENHANCEMENT
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'GUEST',
ADD COLUMN IF NOT EXISTS email TEXT;

-- Sync email from auth.users to profiles (one-time fix)
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND public.profiles.email IS NULL;

-- 2. SOCIAL & COMMUNITY SECTOR TABLES
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('IMAGE', 'VIDEO', 'NONE')) DEFAULT 'NONE',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id TEXT,
    author_email TEXT,
    title TEXT,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public social posts viewable" ON public.social_posts;
CREATE POLICY "Public social posts viewable" ON public.social_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create social posts" ON public.social_posts;
CREATE POLICY "Users can create social posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public stories viewable" ON public.social_stories;
CREATE POLICY "Public stories viewable" ON public.social_stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public posts viewable" ON public.posts;
CREATE POLICY "Public posts viewable" ON public.posts FOR SELECT USING (true);

-- 3. WEALTH SECTOR TABLES
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

-- 4. OPS & SYSTEM TABLES
CREATE TABLE IF NOT EXISTS public.team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'ACCEPTED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'GUEST',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTELLIGENCE & MISSION TABLES
CREATE TABLE IF NOT EXISTS public.neural_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intel_summary TEXT,
    wealth_snapshot JSONB,
    strategic_advice TEXT,
    briefing_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scout_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scout_type TEXT,
    intel_level TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chronos_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    category TEXT,
    is_ai_optimized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for remaining tables
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neural_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronos_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own briefings" ON public.neural_briefings;
CREATE POLICY "Users view own briefings" ON public.neural_briefings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own scout reports" ON public.scout_reports;
CREATE POLICY "Users view own scout reports" ON public.scout_reports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own events" ON public.chronos_events;
CREATE POLICY "Users view own events" ON public.chronos_events FOR SELECT USING (auth.uid() = user_id);

-- FINAL SYNC
INSERT INTO public.users (id)
SELECT id FROM auth.users
ON CONFLICT DO NOTHING;

-- END OF UNIFICATION FIX v2
