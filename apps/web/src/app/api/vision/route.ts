import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Extract parameters with defaults
        const prompt = body.prompt || "A futuristic cyberpunk cityscape";
        // Parse size if provided in format like "1024x1024", otherwise use defaults
        let width = 1024;
        let height = 1024;
        if (body.size) {
            const dims = body.size.split('x');
            if (dims.length === 2) {
                width = parseInt(dims[0]);
                height = parseInt(dims[1]);
            }
        } else if (body.aspect_ratio) {
            // Map aspect ratios if needed
            if (body.aspect_ratio === "16:9") { height = 576; }
            if (body.aspect_ratio === "9:16") { width = 576; }
        }

        // Generate a random seed for uniqueness unless provided
        const seed = body.seed || Math.floor(Math.random() * 1000000000);
        
        // Use Pollinations AI as a highly reliable, free, and serverless fallback engine
        // We append nologo=true to keep it professional for Sovereign OS
        // Default to 512x512 for ultra-fast (1.2s) generation as requested by the Commander
        const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
        
        console.log(`[Sovereign Neural Proxy] Synthesizing via Pollinations: ${targetUrl}`);

        // For maximum speed (1.2s goal), we return the URL directly instead of proxying the buffer.
        // This eliminates the overhead of downloading, encoding, and transmitting large base64 strings.
        return NextResponse.json({
            created: Math.floor(Date.now() / 1000),
            url: targetUrl
        });

    } catch (error: any) {
        console.error('[Sovereign Neural Proxy] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
