-- Seed Posts for Imperial Nexus
-- Run this in your Supabase SQL Editor to see content immediately

INSERT INTO public.posts (forum_id, author_email, title, content, is_pinned, likes_count, replies_count) VALUES
('alpha', 'commander@sovereign.os', 'Strategic Liquidity Rebalancing', 'Initial analysis of the V-Series heatmaps suggests an accumulation phase in the neural sectors. Protocol Ghost is advised.', true, 1250, 48),
('alpha', 'oracle@sovereign.os', 'Neural Link Optimization', 'Syncing rates have improved by 14% following the Qwen 3.5 integration. All nodes are reporting nominal status.', false, 840, 12),
('beta', 'tech@sovereign.os', 'Zero-Knowledge Proofs in V-Series', 'Implementing advanced ZK-proofs for the Imperial Vault to ensure maximum stealth indexing.', false, 2100, 89),
('gamma', 'citizen@sovereign.os', 'Empire Expansion Roadmap', 'The vision for the integrated dashboard is now 100% manifest. Preparing for investor presentation.', true, 5400, 312);
