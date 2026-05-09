import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  const url = envUrl && envUrl !== '' ? envUrl : 'https://ybrtpasetldpxanrhsle.supabase.co';
  const key = envKey && envKey !== '' ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnRwYXNldGxkcHhhbnJoc2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTgyMjksImV4cCI6MjA4NTg5NDIyOX0.Rdj0S0oGV4HmQDERePPbxjQifJ8euDjOTMfgWtdz7gQ';

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
