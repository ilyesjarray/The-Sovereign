import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const intlResponse = (await intlMiddleware(request)) as NextResponse;
  const supabaseResponse = await updateSession(request);

  // Merge Supabase Set-Cookie headers into intl response for session refresh
  const getSetCookie = (supabaseResponse.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const setCookies = getSetCookie?.call(supabaseResponse.headers) ?? [];
  if (setCookies.length) {
    setCookies.forEach((cookie) => intlResponse.headers.append('Set-Cookie', cookie));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
