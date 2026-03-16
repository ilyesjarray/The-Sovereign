import { NextResponse } from 'next/server';

// Web Push Notification endpoint
// Uses the Web Push Protocol — requires VAPID keys
// Generate them: npx web-push generate-vapid-keys
// Set in .env.local: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:sovereign@yourdomain.com';

export async function GET() {
    // Return public key for client subscription
    if (!VAPID_PUBLIC) {
        return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 503 });
    }
    return NextResponse.json({ publicKey: VAPID_PUBLIC });
}

export async function POST(req: Request) {
    if (!VAPID_PRIVATE || !VAPID_PUBLIC) {
        return NextResponse.json({
            error: 'VAPID keys not configured. Generate with: npx web-push generate-vapid-keys'
        }, { status: 503 });
    }

    const { subscription, title, body, url } = await req.json();

    try {
        // web-push is an optional dependency — install it with: npm i web-push
        let webpush: any;
        try {
            webpush = await import('web-push' as any);
        } catch {
            return NextResponse.json({
                error: 'web-push module not installed. Run: npm i web-push in your project root.'
            }, { status: 503 });
        }

        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

        await webpush.sendNotification(subscription, JSON.stringify({
            title: title || 'Sovereign OS Alert',
            body: body || 'New intelligence dispatched.',
            icon: '/logo.png',
            badge: '/badge.png',
            url: url || '/',
        }));

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

}
