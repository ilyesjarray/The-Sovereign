-- =====================================================
-- The Sovereign — USSD Ooredoo Activation Schema
-- Migration 003: Activation Gateway
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create activation status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE activation_status AS ENUM ('pending', 'processing', 'active', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the users_activation table
CREATE TABLE IF NOT EXISTS public.users_activation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_code TEXT NOT NULL CHECK (pin_code ~ '^\d{14}$'),  -- Exactly 14 digits
    status activation_status NOT NULL DEFAULT 'pending',
    failure_reason TEXT,                                     -- USSD error message on failure
    processed_at TIMESTAMPTZ,                                -- When daemon processed it
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_activation_user_id ON public.users_activation(user_id);
CREATE INDEX IF NOT EXISTS idx_users_activation_status ON public.users_activation(status);
CREATE INDEX IF NOT EXISTS idx_users_activation_pending ON public.users_activation(created_at ASC) WHERE status = 'pending';

-- Enforce: only one pending/processing activation per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_activation_one_pending_per_user
    ON public.users_activation(user_id)
    WHERE status IN ('pending', 'processing');

-- 4. Enable Row Level Security
ALTER TABLE public.users_activation ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can INSERT their own activation records
DROP POLICY IF EXISTS "Users can insert own activation" ON public.users_activation;
CREATE POLICY "Users can insert own activation"
    ON public.users_activation
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can SELECT (read) their own activation records
DROP POLICY IF EXISTS "Users can view own activation" ON public.users_activation;
CREATE POLICY "Users can view own activation"
    ON public.users_activation
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role (daemon) can do everything — bypasses RLS by default
-- No explicit policy needed for service_role; it bypasses RLS automatically.

-- 6. Atomic fetch-and-lock function for the Python daemon
-- Selects the oldest 'pending' record, atomically sets it to 'processing',
-- and returns it. Uses FOR UPDATE SKIP LOCKED for concurrency safety.
CREATE OR REPLACE FUNCTION public.fetch_pending_activation()
RETURNS TABLE (
    activation_id UUID,
    activation_user_id UUID,
    activation_pin_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH next_task AS (
        SELECT id, user_id, pin_code
        FROM public.users_activation
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.users_activation a
    SET
        status = 'processing',
        processed_at = NOW()
    FROM next_task
    WHERE a.id = next_task.id
    RETURNING a.id AS activation_id, a.user_id AS activation_user_id, a.pin_code AS activation_pin_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. (Removed auto-upgrade trigger as activation acts solely as an entry gate, keeping user at GUEST tier)
-- Actively drop the old trigger if it exists from a previous run
DROP TRIGGER IF EXISTS trigger_activation_success ON public.users_activation;
DROP FUNCTION IF EXISTS public.on_activation_success();

-- 9. Enable Realtime on users_activation table
-- This allows the frontend to subscribe to changes via Supabase Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users_activation;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.users_activation TO authenticated;
GRANT ALL ON public.users_activation TO service_role;
GRANT EXECUTE ON FUNCTION public.fetch_pending_activation() TO service_role;
