'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Newspaper, Star,
    TrendingUp, Plus, Hash, Filter, Globe,
    ChevronRight, Heart, Share2, Activity, Zap, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const ICON_MAP: Record<string, any> = {
    TrendingUp,
    Hash,
    Globe
};

export function ImperialCommunity() {
    const [forums, setForums] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [activeForum, setActiveForum] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isComposing, setIsComposing] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: forumsData } = await supabase.from('forums').select('*').order('id');
            if (forumsData) {
                setForums(forumsData);
                setActiveForum(forumsData[0]);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!activeForum) return;
        fetchPosts();
    }, [activeForum]);

    const fetchPosts = async () => {
        setLoading(true);
        const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .eq('forum_id', activeForum.id)
            .order('created_at', { ascending: false });
        setPosts(postsData || []);
        setLoading(false);
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim() || !activeForum) return;
        setIsSubmitting(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('posts').insert({
                forum_id: activeForum.id,
                author_email: session.user.email,
                title: newPostTitle,
                content: newPostContent
            });
            setIsComposing(false);
            setNewPostTitle('');
            setNewPostContent('');
            fetchPosts();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex h-full bg-carbon-black overflow-hidden relative">
            {/* Community Sidebar */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.01]">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                        <Users className="text-hyper-cyan" size={18} />
                        Nexus_Community
                    </h3>
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.3em] mt-2">Connecting the Elite Nodes</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Forums List */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-2">Imperial_Forums</span>
                        <div className="space-y-2">
                            {forums.map(forum => {
                                const Icon = ICON_MAP[forum.icon_name] || Globe;
                                return (
                                    <button
                                        key={forum.id}
                                        onClick={() => setActiveForum(forum)}
                                        className={cn(
                                            "w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 border",
                                            activeForum?.id === forum.id
                                                ? "bg-hyper-cyan/10 border-hyper-cyan/30 text-white"
                                                : "bg-white/[0.02] border-transparent text-white/30 hover:bg-white/[0.05]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            activeForum?.id === forum.id ? "bg-hyper-cyan text-carbon-black shadow-neon-cyan" : "bg-white/5"
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-[10px] font-black uppercase italic">{forum.label}</div>
                                            <div className="text-[8px] font-bold opacity-30 mt-0.5">{forum.posts_count} THREADS // {forum.active_nodes_count} ONLINE</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-2">Executive_Nexus</span>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 px-2 group cursor-pointer">
                                    <div className="relative w-8 h-8 rounded-full border border-white/10 p-0.5 group-hover:border-hyper-cyan/40 transition-colors">
                                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden border border-white/5" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-carbon-black" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black text-white/60 uppercase italic group-hover:text-hyper-cyan transition-colors">Commander_Node_{i}</div>
                                        <div className="text-[7px] text-white/20 uppercase font-black">Online & Syncing</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={() => setIsComposing(!isComposing)}
                        className="w-full py-4 bg-hyper-cyan/10 hover:bg-hyper-cyan text-hyper-cyan hover:text-carbon-black rounded-xl border border-hyper-cyan/10 font-black text-[9px] uppercase tracking-[0.4em] transition-all italic"
                    >
                        {isComposing ? 'ABORT_TRANSMISSION' : 'INITIATE_NEW_THREAD'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Forum Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-hyper-cyan font-black tracking-widest uppercase">/portal/nexus/</span>
                            <span className="text-[10px] text-white/20 font-black tracking-widest uppercase italic">{activeForum?.label}</span>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mt-2">{activeForum?.label}</h2>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-v-series h-12 px-6 rounded-xl border border-white/5 flex items-center gap-4 bg-white/[0.01]">
                            <Filter size={14} className="text-white/20" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sort: Trending</span>
                        </div>
                    </div>
                </div>

                <div className="mx-12 mt-10 glass-v-series rounded-[3rem] p-10 bg-hyper-cyan/[0.02] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[250px]">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,186,211,0.1)_0%,transparent_70%)]" />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Globe size={400} className="text-hyper-cyan/20" />
                        </motion.div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border border-hyper-cyan/10 rounded-full flex items-center justify-center"
                            >
                                <div className="absolute inset-0 border-t-2 border-hyper-cyan/40 rounded-full" />
                            </motion.div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-16 h-16 bg-hyper-cyan/20 rounded-full flex items-center justify-center blur-xl"
                                />
                                <Activity size={32} className="text-hyper-cyan absolute z-20" />
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Nexus_Network_Pulse</h3>
                            <div className="flex gap-8 mt-4">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[7px] text-white/20 uppercase font-bold">Latency</span>
                                    <span className="text-[9px] font-mono text-hyper-cyan">14ms</span>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[7px] text-white/20 uppercase font-bold">Sync</span>
                                    <span className="text-[9px] font-mono text-emerald-500">OPTIMAL</span>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[7px] text-white/20 uppercase font-bold">Active_Nodes</span>
                                    <span className="text-[9px] font-mono text-amber-500">2,841</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative z-10">
                    <AnimatePresence>
                        {isComposing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="max-w-4xl mx-auto space-y-4 mb-12 glass-v-series p-8 rounded-3xl border border-hyper-cyan/30 bg-hyper-cyan/[0.02]"
                            >
                                <input
                                    type="text"
                                    value={newPostTitle}
                                    onChange={e => setNewPostTitle(e.target.value)}
                                    placeholder="TRANSMISSION_SUBJECT..."
                                    className="w-full bg-transparent border-b border-white/10 p-4 text-white text-lg font-black uppercase italic outline-none focus:border-hyper-cyan transition-colors placeholder:text-white/20"
                                />
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Enter encrypted message here..."
                                    rows={4}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white text-sm outline-none focus:border-hyper-cyan/50 transition-colors custom-scrollbar resize-none placeholder:text-white/20 italic"
                                />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        onClick={() => setIsComposing(false)}
                                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={isSubmitting || !newPostTitle || !newPostContent}
                                        className="px-8 py-3 bg-hyper-cyan text-carbon-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] italic hover:shadow-neon-cyan transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'BROADCASTING...' : 'BROADCAST_SIGNAL'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div className="h-full flex items-center justify-center text-hyper-cyan uppercase font-black tracking-[1em] italic animate-pulse">
                            SYNCING_NODES...
                        </div>
                    ) : posts.length > 0 ? posts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto space-y-6 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Users size={16} className="text-white/20" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white uppercase italic tracking-wide">{post.title}</div>
                                        <div className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                                            Broadcast by {post.author_email || 'Node_Alpha'} // {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                {post.is_pinned && (
                                    <div className="flex items-center gap-2">
                                        <Star size={14} className="text-hyper-cyan shadow-neon-cyan" />
                                        <span className="text-[10px] font-black text-hyper-cyan uppercase italic">Pinned</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-white/60 text-sm leading-relaxed border-l-2 border-hyper-cyan/20 pl-6 py-2 uppercase italic">
                                "{post.content}"
                            </p>

                            <div className="flex items-center gap-8 py-2 border-t border-white/5 pt-6">
                                <button className="flex items-center gap-3 text-white/30 hover:text-hyper-cyan transition-colors group/btn">
                                    <Heart size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{post.likes_count} Nodes Affinity</span>
                                </button>
                                <button className="flex items-center gap-3 text-white/30 hover:text-hyper-cyan transition-colors group/btn">
                                    <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{post.replies_count} Signal Replies</span>
                                </button>
                                <button className="flex items-center gap-3 text-white/30 hover:text-hyper-cyan transition-colors group/btn">
                                    <Share2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">Broadcast Link</span>
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="h-full flex items-center justify-center text-white/10 uppercase font-black tracking-[1em] italic">
                            NO_SIGNALS_DETECTED_IN_THIS_SECTOR
                        </div>
                    )}
                </div>
            </div>

            {/* Global Throughput Waves (Background Canvas) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                <svg className="w-full h-full">
                    {[...Array(5)].map((_, i) => (
                        <motion.path
                            key={i}
                            d={`M 0 ${20 + i * 15} Q 25% ${10 + i * 20} 50% ${20 + i * 15} T 100% ${20 + i * 15}`}
                            stroke="#10b981"
                            strokeWidth="1"
                            fill="none"
                            animate={{
                                d: [
                                    `M 0 ${20 + i * 15} Q 25% ${10 + i * 20} 50% ${20 + i * 15} T 100% ${20 + i * 15}`,
                                    `M 0 ${20 + i * 15} Q 25% ${30 + i * 20} 50% ${20 + i * 15} T 100% ${20 + i * 15}`,
                                    `M 0 ${20 + i * 15} Q 25% ${10 + i * 20} 50% ${20 + i * 15} T 100% ${20 + i * 15}`,
                                ]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 2 }}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
