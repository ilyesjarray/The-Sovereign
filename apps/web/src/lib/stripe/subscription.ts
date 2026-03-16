import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export const SUBSCRIPTION_TIERS = {
    NOVICE: {
        id: 'price_novice_free',
        name: 'Novice',
        price: 0,
        features: ['Delayed Data', 'Basic Charts'],
    },
    SOVEREIGN: {
        id: 'price_sovereign_monthly', // Replace with real Stripe Price ID
        name: 'Sovereign',
        price: 49,
        features: ['Real-time Alerts', 'AI Summaries'],
    },
    EMPIRE: {
        id: 'price_empire_monthly', // Replace with real Stripe Price ID
        name: 'Empire',
        price: 199,
        features: ['Full AI Predictive Engine', 'Automated Bot Execution'],
    },
};

export async function createCheckoutSession(priceId: string, userId: string) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        metadata: {
            userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return session;
}
