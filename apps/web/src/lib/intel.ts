import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getTrilingualSummary(text: string, locale: string) {
    // Neural Link intelligent summary simulation
    const summaries = {
        en: "AI Analysis: Market showing strong bullish signals in tech sectors.",
    };
    return summaries.en;
}

export async function saveIntel(userId: string, article: any) {
    const { data, error } = await supabase
        .from('saved_intel')
        .insert([{ user_id: userId, title: article.title, source_url: article.url }]);
    return { data, error };
}