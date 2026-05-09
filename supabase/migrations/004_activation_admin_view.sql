-- =====================================================
-- The Sovereign — Activation Admin View
-- Migration 004: Admin monitoring & user identity tracking
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create an admin view that joins activations with user identity
-- This gives you full visibility: name, email, status, PIN, timestamps
CREATE OR REPLACE VIEW public.activation_logs AS
SELECT
    a.id              AS activation_id,
    a.user_id,
    p.full_name       AS user_name,
    p.email           AS user_email,
    a.pin_code,
    a.status,
    a.failure_reason,
    a.created_at      AS submitted_at,
    a.processed_at,
    -- How long the activation took (in seconds)
    CASE
        WHEN a.processed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (a.processed_at - a.created_at))::INTEGER
        ELSE NULL
    END AS processing_seconds
FROM public.users_activation a
LEFT JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;

-- 2. Grant access to service_role only (admin-only view)
GRANT SELECT ON public.activation_logs TO service_role;

-- 3. Update the fetch_pending_activation function to also return user identity
-- So the daemon can log WHO is activating in real-time
CREATE OR REPLACE FUNCTION public.fetch_pending_activation()
RETURNS TABLE (
    activation_id UUID,
    activation_user_id UUID,
    activation_pin_code TEXT,
    activation_user_name TEXT,
    activation_user_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH next_task AS (
        SELECT ua.id, ua.user_id, ua.pin_code
        FROM public.users_activation ua
        WHERE ua.status = 'pending'
        ORDER BY ua.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.users_activation a
    SET
        status = 'processing',
        processed_at = NOW()
    FROM next_task
    LEFT JOIN public.profiles p ON p.id = next_task.user_id
    WHERE a.id = next_task.id
    RETURNING
        a.id AS activation_id,
        a.user_id AS activation_user_id,
        a.pin_code AS activation_pin_code,
        p.full_name AS activation_user_name,
        p.email AS activation_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Quick admin queries you can run anytime in Supabase SQL Editor:

-- See ALL activations with user details:
-- SELECT * FROM activation_logs;

-- See only FAILED activations:
-- SELECT * FROM activation_logs WHERE status = 'failed';

-- See only SUCCESSFUL activations:
-- SELECT * FROM activation_logs WHERE status = 'active';

-- Count activations by status:
-- SELECT status, COUNT(*) FROM activation_logs GROUP BY status;

-- See today's activations:
-- SELECT * FROM activation_logs WHERE submitted_at >= CURRENT_DATE;
