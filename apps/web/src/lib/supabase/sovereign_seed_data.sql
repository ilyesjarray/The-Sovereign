-- =====================================================
-- THE SOVEREIGN — UNIFIED SEED DATA
-- Consolidated from seed_imperial.sql, seed_posts.sql, schema.sql
-- =====================================================

-- 1. IMPERIAL SECTORS (from schema.sql)
INSERT INTO public.imperial_sectors (id, name, status, capacity, power_draw) VALUES
('vault', 'The Vault', 'NOMINAL', 100, 1.25),
('command', 'Global Command', 'NOMINAL', 85, 4.8),
('nexus', 'Neural Nexus', 'EVOLVING', 92, 12.4),
('bio', 'Bio-Sentinel', 'NOMINAL', 100, 0.8),
('projects', 'Imperial Projects', 'NOMINAL', 100, 2.1),
('council', 'High Council', 'NOMINAL', 100, 0.5),
('shadow', 'Shadow Sentinel', 'ALERT', 74, 8.9),
('fleet', 'The Fleet', 'NOMINAL', 100, 6.7),
('mint', 'The Mint', 'NOMINAL', 100, 3.4),
('citadel', 'The Citadel', 'NOMINAL', 100, 1.1),
('academy', 'The Academy', 'NOMINAL', 100, 0.9),
('forge', 'The Forge', 'NOMINAL', 100, 15.6),
('observatory', 'The Observatory', 'NOMINAL', 100, 2.3),
('greenhouse', 'The Greenhouse', 'NOMINAL', 100, 0.4),
('agora', 'The Agora', 'NOMINAL', 100, 0.7)
ON CONFLICT (id) DO NOTHING;

-- 2. FORUMS (from community_schema.sql)
INSERT INTO public.forums (id, label, icon_name, posts_count, active_nodes_count) VALUES
('alpha', 'STRATEGY_FORUM', 'TrendingUp', 124, 12),
('beta', 'TECH_Vortex', 'Hash', 89, 5),
('gamma', 'LIFESTYLE_NODE', 'Globe', 245, 42)
ON CONFLICT (id) DO NOTHING;

-- 3. FORUM POSTS (from seed_posts.sql)
INSERT INTO public.posts (forum_id, author_email, title, content, is_pinned, likes_count, replies_count) VALUES
('alpha', 'commander@sovereign.os', 'Strategic Liquidity Rebalancing', 'Initial analysis of the V-Series heatmaps suggests an accumulation phase in the neural sectors. Protocol Ghost is advised.', true, 1250, 48),
('alpha', 'oracle@sovereign.os', 'Neural Link Optimization', 'Syncing rates have improved by 14% following the Qwen 3.5 integration. All nodes are reporting nominal status.', false, 840, 12),
('beta', 'tech@sovereign.os', 'Zero-Knowledge Proofs in V-Series', 'Implementing advanced ZK-proofs for the Imperial Vault to ensure maximum stealth indexing.', false, 2100, 89),
('gamma', 'citizen@sovereign.os', 'Empire Expansion Roadmap', 'The vision for the integrated dashboard is now 100% manifest. Preparing for investor presentation.', true, 5400, 312);

-- 4. NEURAL BRIEFINGS (from seed_imperial.sql)
INSERT INTO public.neural_briefings (user_id, intel_summary, wealth_snapshot, strategic_advice, briefing_date)
SELECT id,
  'Global market dominance in AI sector detected. Neural patterns indicate high-yield opportunities in decentralized compute.',
  '{"growth": "+12.4% Neural Uplift", "total": "1.2M IV"}'::jsonb,
  'Shift resource allocation from static storage to the Chronos AI engine for maximum temporal efficiency.',
  now()
FROM auth.users LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. SCOUT REPORTS (from seed_imperial.sql)
INSERT INTO public.scout_reports (user_id, scout_type, intel_level, content)
SELECT id, 'MARKET', 'WARNING',
  'WHALE_ALERT: 4,200 BTC moved from unknown wallet to Binance. Potential volatility inbound.'
FROM auth.users LIMIT 1
ON CONFLICT DO NOTHING;

-- 6. CHRONOS EVENTS (from seed_imperial.sql)
INSERT INTO public.chronos_events (user_id, title, start_time, end_time, category, is_ai_optimized)
SELECT id, 'Imperial Sync Session', now() + interval '1 hour', now() + interval '2 hours', 'STRATEGIC', true
FROM auth.users LIMIT 1
ON CONFLICT DO NOTHING;

-- 7. DEFAULT GUEST SUBSCRIPTIONS (from 002)
INSERT INTO user_subscriptions (user_id, tier, status)
SELECT id, 'GUEST', 'active' FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = auth.users.id)
ON CONFLICT DO NOTHING;

-- 8. SYNC USERS TABLE (from unification_fix.sql)
INSERT INTO public.users (id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;

-- END OF SEED DATA
