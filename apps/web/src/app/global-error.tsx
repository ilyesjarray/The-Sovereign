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
            <body className="bg-black text-white flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h2>
                    <p className="text-gray-500 font-mono text-xs mb-6">
                        {error.digest || 'Unknown Error Signature'}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest text-xs font-bold"
                    >
                        Reboot Protocol
                    </button>
                </div>
            </body>
        </html>
    );
}
