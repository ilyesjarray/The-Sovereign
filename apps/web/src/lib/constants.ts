export const SUBSCRIPTION_TIERS = {
  free: 'free',
  starter: 'starter',
  pro: 'pro',
  empire: 'empire',
} as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

export const TIER_FEATURES: Record<
  SubscriptionTier,
  { price: number; label: string; features: string[] }
> = {
  free: {
    price: 0,
    label: 'Free',
    features: ['Basic news feed'],
  },
  starter: {
    price: 19,
    label: 'Starter',
    features: ['Live crypto tracking'],
  },
  pro: {
    price: 49,
    label: 'Pro',
    features: ['Market Arbitrage', 'Professional Economic Reports'],
  },
  empire: {
    price: 199,
    label: 'Empire',
    features: ['Automated Intelligence Bots', 'Early-Access Tech insights'],
  },
};
