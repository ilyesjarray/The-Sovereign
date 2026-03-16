-- 0. Ensure user_tier type exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier') THEN
        CREATE TYPE user_tier AS ENUM ('GUEST', 'ELITE', 'SOVEREIGN', 'EMPIRE');
    END IF;
END $$;

-- 1. Table for Idempotency in Webhooks
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_name TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Function to handle New User Profile creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, tier)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'GUEST'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New User
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to handle Lemon Squeezy Webhooks (Subscription Update)
CREATE OR REPLACE FUNCTION public.handle_ls_webhook(
  p_event_id TEXT,
  p_user_id UUID,
  p_tier user_tier,
  p_ls_sub_id TEXT,
  p_event_name TEXT
)
RETURNS void AS $$
BEGIN
  -- Insert into processed webhooks to prevent duplicates
  INSERT INTO public.processed_webhooks (event_id, event_name)
  VALUES (p_event_id, p_event_name)
  ON CONFLICT (event_id) DO NOTHING;

  -- Update User Tier
  UPDATE public.profiles
  SET tier = p_tier,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
