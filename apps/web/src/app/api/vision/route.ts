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
        
        // Extract the target model from the request, default to 'flux'
        const targetModel = body.model || 'flux';
        
        // Use Pollinations AI as a highly reliable, free, and serverless fallback engine
        // We append nologo=true to keep it professional for Sovereign OS
        const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${targetModel}`;
        
        console.log(`[Sovereign Neural Proxy] Synthesizing via Pollinations: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'image/jpeg'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Generation failed with status ${response.status}: ${errText.slice(0, 100)}`);
        }

        // Convert the raw image buffer to base64 so we don't have to deal with CORS/blobs directly on the frontend
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Return in OpenAI-compatible format
        return NextResponse.json({
            created: Math.floor(Date.now() / 1000),
            b64_json: base64
        });

    } catch (error: any) {
        console.error('[Sovereign Neural Proxy] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
