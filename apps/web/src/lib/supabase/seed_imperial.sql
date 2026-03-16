-- INITIAL_IMPERIAL_SEED
-- This script populates the Sovereign OS with initial live-looking data.

-- 1. Seed Neural Briefings
INSERT INTO public.neural_briefings (user_id, intel_summary, wealth_snapshot, strategic_advice, briefing_date)
SELECT 
  id, 
  'Global market dominance in AI sector detected. Neural patterns indicate high-yield opportunities in decentralized compute.',
  '{"growth": "+12.4% Neural Uplift", "total": "1.2M IV"}'::jsonb,
  'Shift resource allocation from static storage to the Chronos AI engine for maximum temporal efficiency.',
  now()
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- 2. Seed Scout Reports
INSERT INTO public.scout_reports (user_id, scout_type, intel_level, content)
SELECT 
  id, 
  'MARKET', 
  'WARNING', 
  'WHALE_ALERT: 4,200 BTC moved from unknown wallet to Binance. Potential volatility inbound.'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Seed Chronos Events
INSERT INTO public.chronos_events (user_id, title, start_time, end_time, category, is_ai_optimized)
SELECT 
  id, 
  'Imperial Sync Session', 
  now() + interval '1 hour', 
  now() + interval '2 hours', 
  'STRATEGIC',
  true
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;
