'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Image as ImageIcon, Video, Heart, MessageSquare,
    Share2, MoreVertical, Plus, User, Globe, Shield,
    Zap, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '../../ui/AnimatedCounter';

type Post = {
    id: string;
    user_id: string;
    content: string;
    media_url?: string;
    media_type?: 'IMAGE' | 'VIDEO' | 'NONE';
    likes_count: number;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
};

type Story = {
    id: string;
    user_id: string;
    media_url: string;
    created_at: string;
};

export default function SovereignSocial() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [activeTab, setActiveTab] = useState<'FEED' | 'TRENDING' | 'INTEL'>('FEED');
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [systemStats, setSystemStats] = useState({ users: 0, signals24h: 0, traffic24h: '0 GB', syncRate: 0 });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchFeed();
        fetchStories();
        fetchSystemStats();

        // Real-time subscription for new posts
        const channel = supabase.channel('public:social_posts')
            .on('postgres_changes' as any, { event: 'INSERT', table: 'social_posts' }, (payload) => {
                fetchFeed();
                fetchSystemStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchSystemStats = async () => {
        try {
            const res = await fetch('/api/system/stats');
            const data = await res.json();
            setSystemStats(data);
        } catch (e) {
            console.error("Stats Link Failure:", e);
        }
    };

    const fetchFeed = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('social_posts')
            .select('*, profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false });

        if (data) setPosts(data);
        setIsLoading(false);
    };

    const fetchStories = async () => {
        const { data } = await supabase
            .from('social_stories')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setStories(data);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setIsPosting(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Commander, you must be logged in to transmit to the community.");
            setIsPosting(false);
            return;
        }

        const { error } = await supabase
            .from('social_posts')
            .insert([{
                user_id: session.user.id,
                content: newPostContent,
                media_type: 'NONE'
            }]);

        if (!error) {
            setNewPostContent('');
            fetchFeed();
        }
        setIsPosting(false);
    };

    const handleLike = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
        // In production: await supabase.rpc('increment_likes', { post_id: postId });
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex gap-8 h-full">

                {/* Left Side: Feed & Interaction */}
                <div className="flex-1 flex flex-col space-y-8 overflow-y-auto custom-scrollbar pr-4">

                    {/* Header & Tabs */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Sovereign_Social</h1>
                            <p className="text-[10px] text-hyper-cyan uppercase tracking-[0.4em] font-mono mt-1">Global_Connection // Neural_Feed</p>
                        </div>
                        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
                            {['FEED', 'TRENDING', 'INTEL'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab ? "bg-hyper-cyan text-carbon-black" : "text-white/20 hover:text-white/40"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stories Carousel */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-24 lg:w-20 lg:h-32 shrink-0 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-hyper-cyan/30 transition-all bg-white/[0.02]"
                        >
                            <div className="w-8 h-8 rounded-full bg-hyper-cyan/10 flex items-center justify-center border border-hyper-cyan/30 text-hyper-cyan">
                                <Plus size={16} />
                            </div>
                            <span className="text-[8px] font-black text-white/30 uppercase">Add_Story</span>
                        </motion.button>

                        {stories.map((story) => (
                            <motion.div
                                key={story.id}
                                whileHover={{ scale: 1.05 }}
                                className="w-16 h-24 lg:w-20 lg:h-32 shrink-0 rounded-2xl border-2 border-hyper-cyan/40 p-1 relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 rounded-[0.8rem] overflow-hidden bg-white/5">
                                    <img src={story.media_url} alt="story" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Post Composer */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 lg:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Zap size={60} className="text-hyper-cyan" />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <User size={20} className="text-white/20" />
                            </div>
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Commander, transmit your intelligence to the network..."
                                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/10 resize-none pt-3 mt-1"
                                rows={2}
                            />
                        </div>

                        {mediaPreview && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 mb-4">
                                <img src={mediaPreview} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setMediaPreview(null)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black"
                                >
                                    <Plus size={10} className="rotate-45" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setMediaPreview(URL.createObjectURL(file));
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-hyper-cyan hover:border-hyper-cyan/30 transition-all"
                                >
                                    <ImageIcon size={18} />
                                </button>
                                <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                                    <Video size={18} />
                                </button>
                                <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
                                    <TrendingUp size={18} />
                                </button>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreatePost}
                                disabled={isPosting || !newPostContent.trim()}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    newPostContent.trim() ? "bg-hyper-cyan text-carbon-black shadow-neon-cyan" : "bg-white/5 text-white/10 cursor-not-allowed"
                                )}
                            >
                                {isPosting ? 'Transmitting...' : (
                                    <>
                                        <span>Transmit_Intel</span>
                                        <Send size={14} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 lg:p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-white/10 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hyper-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-0.5 border border-white/10 overflow-hidden">
                                            <div className="w-full h-full rounded-[0.9rem] bg-carbon-black flex items-center justify-center">
                                                {post.profiles?.avatar_url ? (
                                                    <img src={post.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                ) : <User size={18} className="text-white/20" />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-white uppercase italic">{post.profiles?.full_name || 'ANONYMOUS_COMMANDER'}</h4>
                                                <Shield size={10} className="text-hyper-cyan shadow-neon-cyan" />
                                            </div>
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button className="text-white/10 hover:text-white transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                <div className="text-sm text-white/70 leading-relaxed font-medium pl-1">
                                    {post.content}
                                </div>

                                {post.media_url && (
                                    <div className="rounded-3xl border border-white/5 overflow-hidden bg-black/20 max-h-[400px]">
                                        {post.media_type === 'IMAGE' ? (
                                            <img src={post.media_url} alt="post media" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={post.media_url} controls className="w-full h-full" />
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-rose-500 transition-colors uppercase tracking-widest"
                                        >
                                            <Heart size={16} />
                                            <span>{post.likes_count}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-hyper-cyan transition-colors uppercase tracking-widest">
                                            <MessageSquare size={16} />
                                            <span>Interact</span>
                                        </button>
                                    </div>
                                    <button className="text-white/10 hover:text-white transition-colors">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Network Stats & Trends */}
                <div className="hidden lg:flex flex-col w-80 space-y-8">

                    {/* Live Network Pulse */}
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-hyper-cyan uppercase tracking-[0.4em] font-mono">Network_Nodes</span>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                                <h3 className="text-xl font-black text-white italic truncate tracking-tighter uppercase">{systemStats.users.toLocaleString()}_Sovereigns</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                                    <span>Signal_Sync_Rate</span>
                                    <span>{systemStats.syncRate}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${systemStats.syncRate}%` }} className="h-full bg-hyper-cyan shadow-neon-cyan" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                                    <span>Verified_Intel_Flow</span>
                                    <span>{systemStats.traffic24h} / 24H</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: systemStats.signals24h > 0 ? '75%' : '5%' }} className="h-full bg-amber-500 shadow-neon-amber" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trending Intelligence */}
                    <div className="flex-1 glass-v-series border border-white/5 rounded-[3rem] bg-white/[0.01] p-8 flex flex-col space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-hyper-cyan shadow-neon-cyan" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Trending_Nexus</span>
                            </div>
                            <Clock size={12} className="text-white/20" />
                        </div>

                        <div className="space-y-6 flex-1">
                            {[
                                { tag: '#FED_DECISION', activity: '4.2k mentions', trend: 'UP' },
                                { tag: '#BTC_LIQUIDITY', activity: '2.8k mentions', trend: 'UP' },
                                { tag: '#WAR_COUNCIL', activity: '1.5k mentions', trend: 'STABLE' },
                                { tag: '#ALPHA_STRIKE', activity: '942 mentions', trend: 'UP' },
                            ].map((item, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black text-white italic group-hover:text-hyper-cyan transition-colors">{item.tag}</span>
                                        {item.trend === 'UP' ? <TrendingUp size={10} className="text-emerald-500" /> : <Globe size={10} className="text-white/20" />}
                                    </div>
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{item.activity}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-hyper-cyan text-white/30 hover:text-carbon-black rounded-2xl border border-white/5 font-black text-[9px] uppercase tracking-widest transition-all italic">
                            <span>Deep_Trend_Scan</span>
                        </button>
                    </div>

                    {/* Footer Guard */}
                    <div className="px-8 flex items-center gap-4 text-[8px] font-black text-white/10 uppercase tracking-widest">
                        <Shield size={12} />
                        Sovereign_Social_Protocol // Level_7
                    </div>
                </div>

            </div>
        </div>
    );
}
