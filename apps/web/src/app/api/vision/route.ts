import { NextResponse } from 'next/server';

const PIXAZO_KEYS = [
    '60805c7b304c4367995fd96537a9596e',
    '4c9d632151594cf4bd43b96476510ea6',
    'c12070df1c54419ebeded1402a9a3186'
];

let currentKeyIndex = 0;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        let attempts = 0;
        let success = false;
        let responseData = null;

        while (attempts < PIXAZO_KEYS.length && !success) {
            const apiKey = PIXAZO_KEYS[currentKeyIndex];
            
            const response = await fetch('https://pixazo.ai', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                redirect: 'follow'
            });

            if (response.status === 429) {
                console.warn(`[Pixazo API Proxy] Key index ${currentKeyIndex} depleted. Rotating...`);
                currentKeyIndex = (currentKeyIndex + 1) % PIXAZO_KEYS.length;
                attempts++;
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errMsg = `API Error: ${response.status}`;
                try {
                    const errObj = JSON.parse(errorText);
                    errMsg = errObj.error?.message || errObj.message || errMsg;
                } catch {
                    errMsg = `${errMsg} - ${errorText.slice(0, 100)}`;
                }
                
                // If we get an internal server error or a weird redirect failure, maybe try next key, but usually we just throw
                if (response.status >= 500) {
                    currentKeyIndex = (currentKeyIndex + 1) % PIXAZO_KEYS.length;
                    attempts++;
                    continue;
                }

                throw new Error(errMsg);
            }

            responseData = await response.json();
            success = true;
        }

        if (!success) {
            return NextResponse.json({ error: 'CREDIT_DEPLETED: All network pathways exhausted or API unavailable.' }, { status: 429 });
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('[Pixazo API Proxy] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
