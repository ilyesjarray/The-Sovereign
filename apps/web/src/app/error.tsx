'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-[#050A1F] text-white flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4 p-10 max-w-lg">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">CRITICAL EMPIRE FAILURE</h2>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-left mb-6">
                        <p className="text-rose-400 font-mono text-xs mb-2 font-bold uppercase tracking-widest">Error_Log:</p>
                        <p className="text-rose-300 font-mono text-[10px] leading-relaxed italic mb-4">{error.message}</p>
                        {error.stack && (
                            <pre className="text-rose-300/30 font-mono text-[8px] leading-tight">
                                {error.stack.split('\n').slice(0, 3).join('\n')}
                            </pre>
                        )}
                    </div>
                    <p className="text-gray-500 font-mono text-[8px] tracking-[0.4em] uppercase mb-4">ERR_SIG: {error.digest || 'UNKNOWN'}</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-white text-black font-bold text-xs rounded"
                    >
                        REBOOT
                    </button>
                </div>
            </body>
        </html>
    );
}
