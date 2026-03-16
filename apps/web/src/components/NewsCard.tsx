import { ExternalLink, ShieldCheck } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  trustScore: number;
}

const mockNews: NewsItem[] = [
  { title: "AI-Powered Legal Bots Boost Efficiency", source: "Bloomberg", trustScore: 98 },
  { title: "New Solar Tech Breaks Records", source: "TechCrunch", trustScore: 95 },
  { title: "Decentralized Social Media Sees User Surge", source: "Reuters", trustScore: 92 },
];

export function NewsCard() {
  return (
    <div className="space-y-4 font-mono">
      {mockNews.map((news, index) => (
        <div key={index} className="p-5 bg-black border border-neon-blue/10 hover:border-neon-blue/40 transition-all group flex flex-col gap-3 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue/5" />

          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-neon-blue/60 italic underline decoration-neon-blue/10">{news.source}_FEED</span>
            <div className="flex items-center gap-2 text-[9px] text-sovereign-blue font-black uppercase tracking-widest">
              <ShieldCheck size={14} className="animate-pulse" /> {news.trustScore}%_PROB_ACCURACY
            </div>
          </div>

          <h4 className="text-[11px] font-black leading-relaxed text-neon-blue/80 group-hover:text-neon-blue transition-colors uppercase tracking-wide italic">
            &gt; {news.title}
          </h4>

          <div className="flex justify-between items-center mt-2 border-t border-neon-blue/5 pt-3">
            <button className="text-[9px] font-black flex items-center gap-2 text-neon-blue/20 hover:text-neon-blue transition-all uppercase tracking-[0.2em] italic">
              VERIFY_INTEL_STREAM <ExternalLink size={10} />
            </button>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-neon-blue/20" />
              <div className="w-1 h-1 bg-neon-blue/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
