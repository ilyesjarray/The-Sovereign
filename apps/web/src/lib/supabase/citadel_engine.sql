-- THE_CITADEL: ENCRYPTED_FILE_STORAGE_SCHEMA
-- This schema handles metadata for encrypted files stored in Supabase Storage.

CREATE TABLE IF NOT EXISTS public.citadel_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_extension TEXT,
  file_size INTEGER NOT NULL, -- in bytes
  storage_path TEXT NOT NULL, -- Path in Supabase bucket
  encryption_version TEXT DEFAULT 'IMPERIAL_V4',
  file_type TEXT DEFAULT 'DOCUMENT', -- 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'OTHER'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Citadel
ALTER TABLE public.citadel_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access their own citadel files" ON public.citadel_files
  FOR ALL USING (auth.uid() = user_id);

-- Note: You need to create a storage bucket named 'citadel' in the Supabase Dashboard
-- with RLS enabled to allow users to read/write their own folders (e.g., /auth.uid()/*)
