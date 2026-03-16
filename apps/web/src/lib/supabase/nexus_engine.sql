-- NEXUS_PROTOCOL: SECURE_DIPLOMATIC_COMMUNICATIONS
-- This schema handles encrypted messaging within the Sovereign ecosystem.

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
  message_type TEXT DEFAULT 'TEXT', -- 'TEXT', 'FILE_LINK', 'SYSTEM'
  expires_at TIMESTAMP WITH TIME ZONE, -- For self-destructing messages
  is_burned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Nexus
ALTER TABLE public.nexus_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own channels" ON public.nexus_channels
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.nexus_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only read messages in their channels" ON public.nexus_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.nexus_channels 
      WHERE id = channel_id AND user_id = auth.uid()
    )
  );

-- Function to handle message burning (auto-delete expired)
CREATE OR REPLACE FUNCTION public.burn_expired_messages()
RETURNS void AS $$
BEGIN
  UPDATE public.nexus_messages
  SET is_burned = true,
      encrypted_body = '[DATA_PURGED_BY_NEXUS_PROTOCOL]'
  WHERE expires_at IS NOT NULL AND expires_at < now() AND is_burned = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
