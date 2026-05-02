-- SOCIAL UPGRADE v1
-- Adds media_type to stories, ensures INSERT policies exist

-- Add media_type to social_stories
ALTER TABLE IF EXISTS public.social_stories
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('IMAGE', 'VIDEO')) DEFAULT 'IMAGE';

-- Ensure users can insert their own stories
DROP POLICY IF EXISTS "Users can create stories" ON public.social_stories;
CREATE POLICY "Users can create stories" ON public.social_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure users can delete their own stories
DROP POLICY IF EXISTS "Users can delete own stories" ON public.social_stories;
CREATE POLICY "Users can delete own stories" ON public.social_stories
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service role / anyone to delete expired stories (for cleanup)
DROP POLICY IF EXISTS "Allow delete expired stories" ON public.social_stories;
CREATE POLICY "Allow delete expired stories" ON public.social_stories
  FOR DELETE USING (created_at < NOW() - INTERVAL '12 hours');
