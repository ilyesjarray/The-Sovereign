-- Subscription Management Schema
-- Handles GUEST, COMMANDER, and ELITE tiers

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('GUEST', 'ELITE', 'SOVEREIGN', 'EMPIRE');

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'GUEST',
    status subscription_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    payment_provider TEXT, -- 'lemonsqueezy', 'stripe', 'crypto', etc.
    payment_id TEXT, -- External payment ID
    payment_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one active subscription per user
    UNIQUE(user_id, status) WHERE status = 'active'
);

-- Subscription History Table (for audit trail)
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    tier subscription_tier NOT NULL,
    status subscription_status NOT NULL,
    action TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'cancelled', 'expired'
    metadata JSONB, -- Additional data about the action
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crypto Intelligence Table
CREATE TABLE IF NOT EXISTS crypto_intelligence (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    source TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    relevance_score DECIMAL(3,2),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_published_at ON crypto_intelligence(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_sentiment ON crypto_intelligence(sentiment);
CREATE INDEX IF NOT EXISTS idx_crypto_intelligence_user_bookmarks ON crypto_intelligence(user_id, is_bookmarked) WHERE is_bookmarked = TRUE;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_intelligence ENABLE ROW LEVEL SECURITY;

-- User Subscriptions Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (for initial signup)
CREATE POLICY "Users can insert own subscriptions"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
    ON user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Subscription History Policies
-- Users can view their own history
CREATE POLICY "Users can view own subscription history"
    ON subscription_history FOR SELECT
    USING (auth.uid() = user_id);

-- System can insert history (service role)
CREATE POLICY "Service role can insert subscription history"
    ON subscription_history FOR INSERT
    WITH CHECK (true);

-- Crypto Intelligence Policies
-- All authenticated users can view intelligence
CREATE POLICY "Authenticated users can view intelligence"
    ON crypto_intelligence FOR SELECT
    USING (auth.role() = 'authenticated');

-- Service role can insert/update intelligence
CREATE POLICY "Service role can manage intelligence"
    ON crypto_intelligence FOR ALL
    USING (auth.role() = 'service_role');

-- Users can bookmark intelligence
CREATE POLICY "Users can bookmark intelligence"
    ON crypto_intelligence FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_intelligence_updated_at
    BEFORE UPDATE ON crypto_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
        VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, 'created', 
                jsonb_build_object('payment_provider', NEW.payment_provider));
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.tier != NEW.tier THEN
            INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
            VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, 
                    CASE 
                        WHEN NEW.tier > OLD.tier THEN 'upgraded'
                        ELSE 'downgraded'
                    END,
                    jsonb_build_object('old_tier', OLD.tier, 'new_tier', NEW.tier));
        END IF;
        IF OLD.status != NEW.status THEN
            INSERT INTO subscription_history (user_id, subscription_id, tier, status, action, metadata)
            VALUES (NEW.user_id, NEW.id, NEW.tier, NEW.status, 
                    CASE 
                        WHEN NEW.status = 'cancelled' THEN 'cancelled'
                        WHEN NEW.status = 'expired' THEN 'expired'
                        ELSE 'status_changed'
                    END,
                    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription changes
CREATE TRIGGER log_subscription_changes
    AFTER INSERT OR UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_change();

-- Function to get user tier
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS subscription_tier AS $$
DECLARE
    v_tier subscription_tier;
BEGIN
    SELECT tier INTO v_tier
    FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(v_tier, 'GUEST');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to feature
CREATE OR REPLACE FUNCTION has_feature_access(
    p_user_id UUID,
    p_required_tier subscription_tier
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_tier subscription_tier;
BEGIN
    v_user_tier := get_user_tier(p_user_id);
    
    -- GUEST = 0, ELITE = 1, SOVEREIGN = 2, EMPIRE = 3
    RETURN CASE v_user_tier
        WHEN 'EMPIRE' THEN TRUE
        WHEN 'SOVEREIGN' THEN p_required_tier IN ('GUEST', 'ELITE', 'SOVEREIGN')
        WHEN 'ELITE' THEN p_required_tier IN ('GUEST', 'ELITE')
        WHEN 'GUEST' THEN p_required_tier = 'GUEST'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default GUEST subscription for existing users
INSERT INTO user_subscriptions (user_id, tier, status)
SELECT id, 'GUEST', 'active'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.users.id
)
ON CONFLICT DO NOTHING;
