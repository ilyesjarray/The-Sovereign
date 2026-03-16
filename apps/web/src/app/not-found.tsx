/* eslint-disable @next/next/no-html-link-for-pages */


export default function GlobalNotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050A1F] text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400">Resource not found in Sovereign Intelligence Layer.</p>
                <a href="/" className="mt-8 inline-block px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    Return to Base
                </a>
            </div>
        </div>
    );
}
