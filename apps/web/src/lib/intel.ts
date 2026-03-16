import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getTrilingualSummary(text: string, locale: string) {
    // هنا يمكنك ربط OpenAI أو أي مكتبة ترجمة
    // حالياً سنقوم بمحاكاة العملية (Mock Logic)
    const summaries = {
        en: "AI Analysis: Market showing strong bullish signals in tech sectors.",
        ar: "تحليل الذكاء الاصطناعي: يظهر السوق إشارات صعودية قوية في القطاعات التكنولوجية.",
        fr: "Analyse IA: Le marché affiche de fortress signaux haussiers dans les secteurs tech."
    };
    return summaries[locale as keyof typeof summaries] || summaries.en;
}

export async function saveIntel(userId: string, article: any) {
    const { data, error } = await supabase
        .from('saved_intel')
        .insert([{ user_id: userId, title: article.title, source_url: article.url }]);
    return { data, error };
}