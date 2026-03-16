import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  const url = envUrl && envUrl !== '' ? envUrl : 'https://suujqiaihjktpmjnogdm.supabase.co';
  const key = envKey && envKey !== '' ? envKey : 'placeholder';

  return createBrowserClient(url, key)
}