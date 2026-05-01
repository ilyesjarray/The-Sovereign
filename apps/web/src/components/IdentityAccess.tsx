'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, LogOut, ChevronDown, CreditCard, Fingerprint, Zap, Camera, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface IdentityAccessProps {
    onSectorChange?: (sectorId: string) => void;
}

/**
 * Compresses an image file to ~1/4 of its original size using Canvas API.
 * Returns a base64 data URL and a Blob for upload.
 */
async function compressImage(file: File): Promise<{ dataUrl: string; blob: Blob }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Reduce dimensions to ~50% = ~25% pixel count (1/4 size)
                const MAX_SIZE = 256;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_SIZE) {
                    height = Math.round(height * (MAX_SIZE / width));
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round(width * (MAX_SIZE / height));
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context unavailable');

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject('Blob creation failed');
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                        resolve({ dataUrl, blob });
                    },
                    'image/jpeg',
                    0.5 // quality = 50%
                );
            };
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function IdentityAccess({ onSectorChange }: IdentityAccessProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [userTier, setUserTier] = useState<string>('GUEST');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dropdownStyles, setDropdownStyles] = useState({});
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
                setUserId(session.user.id);

                // Fetch Profile for Tier & Avatar
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserTier(profile.tier);
                    if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
                }
            }
        };

        fetchUserData();

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = userEmail ? userEmail.split('@')[0] : 'GUEST';

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        router.push('/');
        router.refresh();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        setIsUploading(true);
        try {
            // Compress the image to ~1/4 size
            const { dataUrl, blob } = await compressImage(file);

            // Upload to Supabase Storage — citadel bucket, user's folder
            const filePath = `${userId}/avatar.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('citadel')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                    upsert: true, // overwrite existing avatar
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                setIsUploading(false);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('citadel')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl + '?t=' + Date.now(); // cache bust

            // Update profile in database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) {
                console.error('Profile update error:', updateError);
            } else {
                setAvatarUrl(publicUrl);
            }
        } catch (err) {
            console.error('Avatar upload failed:', err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const menuItems = [
        { label: 'Security Clearance', icon: Shield, href: '#', desc: 'Manage access levels', id: 'sovereign-vault', menuKey: 'security-clearance' },
        { label: 'Treasury & Billing', icon: CreditCard, href: '#', desc: 'Subscription status', id: 'imperial-billing', menuKey: 'treasury-billing' },
        { label: 'System Config', icon: Settings, href: '#', desc: 'OS Preferences', id: 'system-settings', menuKey: 'system-config' },
    ];

    const handleToggle = () => {
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setDropdownStyles({
                top: rect.bottom + 16,
                right: window.innerWidth - rect.right
            });
        }
        setIsOpen(!isOpen);
    };

    // Reusable avatar element
    const AvatarIcon = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => {
        const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
        const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

        if (avatarUrl) {
            return (
                <div className={cn(dimensions, "rounded-lg border border-hyper-cyan/30 overflow-hidden relative")}>
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-hyper-cyan animate-pulse" />
                </div>
            );
        }

        return (
            <div className={cn(dimensions, "rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center relative overflow-hidden")}>
                <Fingerprint className={cn(iconSize, "text-hyper-cyan group-hover:scale-110 transition-transform")} />
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-hyper-cyan animate-pulse" />
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
            />

            <button
                onClick={handleToggle}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-hyper-cyan/30 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-hyper-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                    <AvatarIcon size="sm" />
                </div>

                <div className="hidden lg:flex flex-col items-start relative z-10 text-left">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none truncate max-w-[80px]">
                        {displayName}
                    </span>
                    <span className={cn(
                        "text-[8px] font-bold uppercase tracking-tighter leading-none mt-1",
                        userTier === 'EMPIRE' ? "text-blue-400" : userTier === 'SOVEREIGN' ? "text-hyper-cyan" : userTier === 'ELITE' ? "text-white/80" : "text-white/40"
                    )}>
                        {userTier} ACCESS
                    </span>
                </div>

                <ChevronDown
                    className="w-3.5 h-3.5 text-white/20 transition-transform duration-300 group-hover:text-hyper-cyan"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                />
            </button>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Blur Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl"
                                onClick={() => setIsOpen(false)}
                            />
                            
                            {/* Dropdown Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                style={dropdownStyles}
                                className="fixed w-72 glass-v-series border border-white/10 z-[110] shadow-premium rounded-2xl overflow-hidden"
                            >
                        {/* Header: User Profile Segment */}
                        <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-br from-hyper-cyan/5 to-transparent">
                            <div className="flex items-center gap-4 mb-4">
                                {/* Clickable Avatar with Upload */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="relative group/avatar cursor-pointer shrink-0"
                                    title="Change profile picture"
                                >
                                    {avatarUrl ? (
                                        <div className="w-12 h-12 rounded-xl border border-hyper-cyan/40 overflow-hidden shadow-neon-cyan">
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-hyper-cyan/20 border border-hyper-cyan/40 flex items-center justify-center shadow-neon-cyan">
                                            <User className="w-6 h-6 text-hyper-cyan" />
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 text-hyper-cyan animate-spin" />
                                        ) : (
                                            <Camera className="w-5 h-5 text-hyper-cyan" />
                                        )}
                                    </div>
                                </button>

                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-black text-white tracking-widest uppercase truncate">
                                        {displayName}
                                    </span>
                                    <span className="text-[10px] text-white/40 truncate">{userEmail || 'Verification Pending'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/20">
                                <Zap className="w-3 h-3 text-hyper-cyan" />
                                <span className="text-[9px] font-black text-hyper-cyan uppercase tracking-widest">Empire Tier Active</span>
                            </div>
                        </div>

                        <div className="p-3 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.menuKey}
                                    className="w-full"
                                    onClick={() => {
                                        onSectorChange?.(item.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-hyper-cyan group-hover:bg-hyper-cyan/10 transition-colors">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black text-white/60 group-hover:text-white uppercase tracking-widest transition-colors">
                                                {item.label}
                                            </span>
                                            <span className="text-[8px] text-white/20 uppercase tracking-wider">{item.desc}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action Segment */}
                        <div className="p-3 border-t border-white/5 bg-white/2">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-blue-500/60 hover:text-blue-500 hover:bg-blue-500/10 transition-all group font-black uppercase tracking-[0.2em] text-[10px]"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Link</span>
                            </button>
                        </div>
                    </motion.div>
                    </>
                )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
