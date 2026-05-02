import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
    try {
        const now = new Date();
        const cutoff12h = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
        const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        let deletedStories = 0;
        let deletedMedia = 0;

        // 1. Delete expired stories (>12h) from DB + storage
        const { data: expiredStories } = await supabaseAdmin
            .from('social_stories')
            .select('id, media_url, user_id')
            .lt('created_at', cutoff12h);

        if (expiredStories?.length) {
            // Delete storage files
            const storagePaths = expiredStories
                .map(s => {
                    try {
                        const url = new URL(s.media_url);
                        const parts = url.pathname.split('/storage/v1/object/public/citadel/');
                        return parts[1] || null;
                    } catch { return null; }
                })
                .filter(Boolean) as string[];

            if (storagePaths.length) {
                await supabaseAdmin.storage.from('citadel').remove(storagePaths);
            }

            // Delete DB records
            const ids = expiredStories.map(s => s.id);
            await supabaseAdmin.from('social_stories').delete().in('id', ids);
            deletedStories = ids.length;
        }

        // 2. Delete old post media (>48h) from storage — preserve avatars
        const { data: bucketFiles } = await supabaseAdmin.storage.from('citadel').list('', { limit: 500 });
        
        if (bucketFiles) {
            for (const userFolder of bucketFiles) {
                if (!userFolder.name || userFolder.name === '.emptyFolderPlaceholder') continue;
                
                // List posts/ and stories/ subfolders — skip avatar.jpg
                for (const subfolder of ['posts', 'stories']) {
                    const { data: files } = await supabaseAdmin.storage
                        .from('citadel')
                        .list(`${userFolder.name}/${subfolder}`, { limit: 200 });

                    if (files?.length) {
                        const oldFiles = files
                            .filter(f => {
                                if (!f.created_at) return false;
                                return new Date(f.created_at).getTime() < new Date(cutoff48h).getTime();
                            })
                            .map(f => `${userFolder.name}/${subfolder}/${f.name}`);

                        if (oldFiles.length) {
                            await supabaseAdmin.storage.from('citadel').remove(oldFiles);
                            deletedMedia += oldFiles.length;
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            status: 'CLEANUP_COMPLETE',
            deletedStories,
            deletedMedia,
            timestamp: now.toISOString()
        });
    } catch (error: any) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
