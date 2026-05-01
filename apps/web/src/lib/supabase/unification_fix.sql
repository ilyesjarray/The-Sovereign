-- ==========================================
-- SOVEREIGN-NEYDRA UNIFICATION FIX
-- Resolves 404/400 errors by ensuring all expected tables exist.
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

-- 2. SOCIAL SECTOR TABLES
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

-- Enable RLS for Social
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public social posts are viewable by everyone" ON public.social_posts;
CREATE POLICY "Public social posts are viewable by everyone" ON public.social_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.social_posts;
CREATE POLICY "Users can create their own posts" ON public.social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON public.social_stories;
CREATE POLICY "Public stories are viewable by everyone" ON public.social_stories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own stories" ON public.social_stories;
CREATE POLICY "Users can create their own stories" ON public.social_stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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

DROP POLICY IF EXISTS "Users manage their own portfolios" ON public.user_portfolios;
CREATE POLICY "Users manage their own portfolios" ON public.user_portfolios
    FOR ALL USING (auth.uid() = user_id);

-- 4. OPS SECTOR TABLES
CREATE TABLE IF NOT EXISTS public.team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'ACCEPTED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage their invites" ON public.team_invites;
CREATE POLICY "Owners manage their invites" ON public.team_invites
    FOR ALL USING (auth.uid() = owner_id);

-- 5. BILLING / SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'GUEST',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 6. SYSTEM TABLES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- END OF UNIFICATION FIX
