import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { payment_status, buyer_email, amount } = body;

        // Process only finished or confirming payments
        if (payment_status === 'finished' || payment_status === 'confirming') {
            if (!buyer_email) {
                return NextResponse.json({ error: "No email provided" }, { status: 400 });
            }

            // Determine Plan based on amount (matching Neydra logic)
            let plan = 'STANDARD';
            if (amount >= 50 && amount < 90) plan = 'PREMIUM';
            if (amount >= 90) plan = 'ULTRA';

            // Update User Profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    tier: plan,
                    updated_at: new Date().toISOString()
                })
                .eq('email', buyer_email);

            if (error) {
                console.error("[NOWPayments Webhook]: DB Update Error", error);
                return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            }

            console.log(`[NOWPayments]: Access Granted to ${buyer_email} -> ${plan}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("[NOWPayments Webhook]: Processing Error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
