/**
 * Intel Storage Service
 * Manages storage and retrieval of crypto intelligence in Supabase
 */

import { createClient } from '@/lib/supabase/client';
import type { CryptoIntelligence } from './serper-service';

export interface StoredIntelligence extends CryptoIntelligence {
    created_at: string;
    updated_at: string;
    user_id?: string;
    is_bookmarked?: boolean;
}

class IntelStorageService {
    private tableName = 'crypto_intelligence';

    /**
     * Store intelligence data in Supabase
     */
    async storeIntelligence(intel: CryptoIntelligence[]): Promise<void> {
        const supabase = createClient();

        try {
            // Check if table exists, if not, we'll just cache locally
            const { data: existingData, error: checkError } = await supabase
                .from(this.tableName)
                .select('id')
                .limit(1);

            // If table doesn't exist, skip storage (will be created by migration)
            if (checkError && checkError.code === '42P01') {
                console.warn('Intelligence table not yet created. Run database migration.');
                return;
            }

            // Prepare data for insertion
            const dataToInsert = intel.map(item => ({
                id: item.id,
                title: item.title,
                url: item.url,
                summary: item.summary,
                source: item.source,
                published_at: item.publishedAt,
                image_url: item.imageUrl,
                sentiment: item.sentiment,
                relevance_score: item.relevanceScore,
            }));

            // Upsert data (insert or update if exists)
            const { error } = await supabase
                .from(this.tableName)
                .upsert(dataToInsert, { onConflict: 'id' });

            if (error) {
                console.error('Error storing intelligence:', error);
            }
        } catch (error) {
            console.error('Error in storeIntelligence:', error);
        }
    }

    /**
     * Fetch intelligence from Supabase
     */
    async fetchIntelligence(limit: number = 20): Promise<StoredIntelligence[]> {
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) {
                if (error.code === '42P01') {
                    console.warn('Intelligence table not yet created.');
                    return [];
                }
                throw error;
            }

            return (data || []).map(item => ({
                id: item.id,
                title: item.title,
                url: item.url,
                summary: item.summary,
                source: item.source,
                publishedAt: item.published_at,
                imageUrl: item.image_url,
                sentiment: item.sentiment,
                relevanceScore: item.relevance_score,
                created_at: item.created_at,
                updated_at: item.updated_at,
                user_id: item.user_id,
                is_bookmarked: item.is_bookmarked,
            }));
        } catch (error) {
            console.error('Error fetching intelligence:', error);
            return [];
        }
    }

    /**
     * Fetch intelligence by sentiment
     */
    async fetchBySentiment(sentiment: 'positive' | 'negative' | 'neutral', limit: number = 10): Promise<StoredIntelligence[]> {
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('sentiment', sentiment)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                title: item.title,
                url: item.url,
                summary: item.summary,
                source: item.source,
                publishedAt: item.published_at,
                imageUrl: item.image_url,
                sentiment: item.sentiment,
                relevanceScore: item.relevance_score,
                created_at: item.created_at,
                updated_at: item.updated_at,
            }));
        } catch (error) {
            console.error('Error fetching by sentiment:', error);
            return [];
        }
    }

    /**
     * Bookmark intelligence for a user
     */
    async bookmarkIntelligence(intelId: string, userId: string): Promise<boolean> {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from(this.tableName)
                .update({ is_bookmarked: true, user_id: userId })
                .eq('id', intelId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error bookmarking intelligence:', error);
            return false;
        }
    }

    /**
     * Clean old intelligence data (older than 7 days)
     */
    async cleanOldData(): Promise<void> {
        const supabase = createClient();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        try {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .lt('published_at', sevenDaysAgo)
                .eq('is_bookmarked', false);

            if (error) throw error;
        } catch (error) {
            console.error('Error cleaning old data:', error);
        }
    }
}

// Singleton instance
let intelStorageInstance: IntelStorageService | null = null;

export function getIntelStorageService(): IntelStorageService {
    if (!intelStorageInstance) {
        intelStorageInstance = new IntelStorageService();
    }
    return intelStorageInstance;
}

export default IntelStorageService;
