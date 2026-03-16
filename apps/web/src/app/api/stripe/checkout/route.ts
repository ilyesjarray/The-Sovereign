import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || stripeKey.includes('mock') || stripeKey.length < 20) {
        return NextResponse.json({
            error: 'STRIPE_SECRET_KEY not configured. Please add your real Stripe key to .env.local to enable payments.'
        }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' } as any);

    try {
        const { planId, email } = await req.json();

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: planId === 'elite' ? 'Sovereign Elite Commander' : 'Sovereign Pro',
                            description: 'Gain full access to AI Trading Agent, B2B Teams, and Unlimited Storage.',
                        },
                        unit_amount: planId === 'elite' ? 9900 : 2900, // $99.00 or $29.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/dashboard?checkout=success`,
            cancel_url: `${req.headers.get('origin')}/dashboard?checkout=canceled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

