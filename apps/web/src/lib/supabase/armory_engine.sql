-- THE_ARMORY: FINANCIAL_EXECUTION_ENGINE
-- This schema handles real-world asset tracking and wallet integration metadata.

CREATE TABLE IF NOT EXISTS public.armory_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'SOLANA', -- 'SOLANA', 'ETHEREUM', 'BITCOIN'
  label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.armory_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.armory_wallets ON DELETE SET NULL,
  transaction_hash TEXT,
  side TEXT NOT NULL, -- 'BUY', 'SELL', 'TRANSFER'
  asset_symbol TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Armory
ALTER TABLE public.armory_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own wallets" ON public.armory_wallets
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.armory_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own executions" ON public.armory_executions
  FOR ALL USING (auth.uid() = user_id);
