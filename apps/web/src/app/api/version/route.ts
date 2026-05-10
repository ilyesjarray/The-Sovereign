import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    // Vercel injects NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA at build time
    // We fall back to standard VERCEL_GIT_COMMIT_SHA, or a fallback string if local
    const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'dev-local';
    
    return NextResponse.json({ version });
}
