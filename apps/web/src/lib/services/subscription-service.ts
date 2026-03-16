/**
 * Subscription Service
 * Manages user subscription tiers and feature access
 */

import { createClient } from '@/lib/supabase/client';

export type UserTier = 'GUEST' | 'ELITE' | 'SOVEREIGN' | 'EMPIRE';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface UserSubscription {
    id: string;
    user_id: string;
    tier: UserTier;
    status: SubscriptionStatus;
    started_at: string;
    expires_at?: string;
    payment_provider?: string;
    payment_id?: string;
    created_at: string;
    updated_at: string;
}

export interface TierFeatures {
    name: string;
    price: number;
    maxBots: number;
    whaleTracking: boolean;
    flashArbitrage: boolean;
    aiPredictions: boolean;
    shadowProtocol: boolean;
    wealthManager: boolean;
    institutionalAlpha: boolean;
    prioritySupport: boolean;
    prestigeUI: boolean;
    sentimentNexus: boolean;
    quantumRisk: boolean;
    orderFlow: boolean;
    macroIntelligence: boolean;
    multiEntity: boolean;
    inheritanceProtocol: boolean;
}

// Type alias for compatibility
export type SubscriptionInfo = UserSubscription;

export class SubscriptionService {
    private static instance: SubscriptionService | null = null;
    private supabase = createClient();

    /**
     * Get singleton instance (for compatibility)
     */
    static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    private tierFeatures: Record<UserTier, TierFeatures> = {
        GUEST: {
            name: 'Guest',
            price: 0,
            maxBots: 1,
            whaleTracking: false,
            flashArbitrage: false,
            aiPredictions: false,
            shadowProtocol: false,
            wealthManager: false,
            institutionalAlpha: false,
            prioritySupport: false,
            prestigeUI: false,
            sentimentNexus: false,
            quantumRisk: false,
            orderFlow: false,
            macroIntelligence: false,
            multiEntity: false,
            inheritanceProtocol: false,
        },
        ELITE: {
            name: 'Elite',
            price: 19,
            maxBots: 5,
            whaleTracking: true,
            flashArbitrage: true,
            aiPredictions: false,
            shadowProtocol: false,
            wealthManager: true,
            institutionalAlpha: true,
            prioritySupport: true,
            prestigeUI: false,
            sentimentNexus: true,
            quantumRisk: false,
            orderFlow: false,
            macroIntelligence: true,
            multiEntity: false,
            inheritanceProtocol: false,
        },
        SOVEREIGN: {
            name: 'Sovereign',
            price: 49,
            maxBots: 25,
            whaleTracking: true,
            flashArbitrage: true,
            aiPredictions: true,
            shadowProtocol: true,
            wealthManager: true,
            institutionalAlpha: true,
            prioritySupport: true,
            prestigeUI: true,
            sentimentNexus: true,
            quantumRisk: true,
            orderFlow: true,
            macroIntelligence: true,
            multiEntity: false,
            inheritanceProtocol: false,
        },
        EMPIRE: {
            name: 'Empire',
            price: 120,
            maxBots: 999,
            whaleTracking: true,
            flashArbitrage: true,
            aiPredictions: true,
            shadowProtocol: true,
            wealthManager: true,
            institutionalAlpha: true,
            prioritySupport: true,
            prestigeUI: true,
            sentimentNexus: true,
            quantumRisk: true,
            orderFlow: true,
            macroIntelligence: true,
            multiEntity: true,
            inheritanceProtocol: true,
        },
    };

    async getUserSubscription(userId: string): Promise<UserSubscription | null> {
        try {
            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.warn("[Vault Connection Error]: Falling back to encrypted PRO buffer.", error);
                return this.getFallbackSubscription(userId);
            }
            return data;
        } catch (error) {
            console.warn('Error getting user subscription (likely network/env), returning PRO fallback:', error);
            return this.getFallbackSubscription(userId);
        }
    }

    private getFallbackSubscription(userId: string): UserSubscription {
        return {
            id: 'fallback-guest',
            user_id: userId,
            tier: 'GUEST',
            status: 'active',
            started_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    /**
     * Get user's tier
     */
    async getUserTier(userId: string): Promise<UserTier> {
        const subscription = await this.getUserSubscription(userId);
        return subscription?.tier || 'GUEST';
    }

    /**
     * Check if user has access to a feature
     */
    async hasFeatureAccess(userId: string, feature: keyof TierFeatures): Promise<boolean> {
        const tier = await this.getUserTier(userId);
        const features = this.tierFeatures[tier];
        return features[feature] as boolean;
    }

    /**
     * Get tier features
     */
    getTierFeatures(tier: UserTier): TierFeatures {
        return this.tierFeatures[tier];
    }

    /**
     * Create GUEST subscription for new user
     */
    private async createGuestSubscription(userId: string): Promise<UserSubscription> {
        const guestSubscription: Partial<UserSubscription> = {
            user_id: userId,
            tier: 'GUEST',
            status: 'active',
            started_at: new Date().toISOString(),
        };

        try {
            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .insert(guestSubscription)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating guest subscription:', error);
            // Return a default guest subscription object
            return {
                id: 'guest-default',
                user_id: userId,
                tier: 'GUEST',
                status: 'active',
                started_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        }
    }

    /**
     * Upgrade user subscription
     */
    async upgradeSubscription(
        userId: string,
        newTier: UserTier,
        paymentProvider: string,
        paymentId: string
    ): Promise<boolean> {
        try {
            // Cancel existing subscription
            await this.supabase
                .from('user_subscriptions')
                .update({ status: 'cancelled' })
                .eq('user_id', userId)
                .eq('status', 'active');

            // Create new subscription
            const { error } = await this.supabase
                .from('user_subscriptions')
                .insert({
                    user_id: userId,
                    tier: newTier,
                    status: 'active',
                    started_at: new Date().toISOString(),
                    payment_provider: paymentProvider,
                    payment_id: paymentId,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            return false;
        }
    }

    /**
     * Cancel user subscription
     */
    async cancelSubscription(userId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('user_subscriptions')
                .update({ status: 'cancelled' })
                .eq('user_id', userId)
                .eq('status', 'active');

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            return false;
        }
    }

    /**
     * Check if subscription is expired and update status
     */
    async checkAndUpdateExpiredSubscriptions(): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('user_subscriptions')
                .update({ status: 'expired' })
                .eq('status', 'active')
                .lt('expires_at', new Date().toISOString());

            if (error) throw error;
        } catch (error) {
            console.error('Error updating expired subscriptions:', error);
        }
    }

    /**
     * Check if a specific tier can access a feature (for compatibility)
     */
    canAccess(feature: string, tier: UserTier): boolean {
        const features = this.tierFeatures[tier];
        // Map feature strings to TierFeatures keys
        const featureMap: Record<string, keyof TierFeatures> = {
            'whale_tracking': 'whaleTracking',
            'flash_arbitrage': 'flashArbitrage',
            'ai_predictions': 'aiPredictions',
            'shadow_protocol': 'shadowProtocol',
            'wealth_manager': 'wealthManager',
            'institutional_alpha': 'institutionalAlpha',
            'prestige_ui': 'prestigeUI',
            'sentiment_nexus': 'sentimentNexus',
            'quantum_risk': 'quantumRisk',
            'order_flow': 'orderFlow',
            'macro_intelligence': 'macroIntelligence'
        };

        const key = featureMap[feature];
        if (key && typeof features[key] === 'boolean') {
            return features[key] as boolean;
        }

        // Default: GUEST is the base tier in Sovereign OS
        return false;
    }
}

// Singleton instance
let subscriptionServiceInstance: SubscriptionService | null = null;

export function getSubscriptionService(): SubscriptionService {
    if (!subscriptionServiceInstance) {
        subscriptionServiceInstance = new SubscriptionService();
    }
    return subscriptionServiceInstance;
}

export default SubscriptionService;
