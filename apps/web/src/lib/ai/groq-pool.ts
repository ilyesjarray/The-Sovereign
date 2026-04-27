/**
 * SOVEREIGN GROQ API KEY POOL
 * Rotates through 3 API keys for balanced usage.
 * On failure/rate-limit, automatically tries the next key.
 */

const GROQ_KEYS = [
    process.env.GROQ_API_KEY || '',
    process.env.GROQ_API_KEY_2 || '',
    process.env.GROQ_API_KEY_3 || '',
].filter(k => k.length > 0);

let currentKeyIndex = 0;

export function getGroqKey(): string {
    if (GROQ_KEYS.length === 0) {
        throw new Error('SOVEREIGN_ERROR: No Groq API keys configured.');
    }
    return GROQ_KEYS[currentKeyIndex % GROQ_KEYS.length];
}

export function rotateKey(): string {
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
    return GROQ_KEYS[currentKeyIndex];
}

export function getGroqHeaders(): Record<string, string> {
    return {
        'Authorization': `Bearer ${getGroqKey()}`,
        'Content-Type': 'application/json',
    };
}

/**
 * Make a Groq API call with automatic key rotation on failure.
 */
export async function callGroq(
    messages: Array<{ role: string; content: string }>,
    options: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        systemPrompt?: string;
    } = {}
): Promise<string> {
    const {
        model = 'llama-3.3-70b-versatile',
        temperature = 0.7,
        max_tokens = 4096,
        systemPrompt,
    } = options;

    const fullMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: getGroqHeaders(),
                body: JSON.stringify({
                    model,
                    messages: fullMessages,
                    temperature,
                    max_tokens,
                }),
            });

            if (response.status === 429 || response.status === 503) {
                // Rate limited or overloaded — rotate key and retry
                rotateKey();
                continue;
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Groq API HTTP ${response.status}: ${errorBody}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'ORACLE_ERROR: Empty response.';
        } catch (error: any) {
            lastError = error;
            rotateKey();
        }
    }

    throw lastError || new Error('SOVEREIGN_ERROR: All Groq API keys exhausted.');
}

/**
 * Make a Groq Whisper speech-to-text call with key rotation.
 */
export async function callWhisper(audioBlob: Blob, model: string = 'whisper-large-v3-turbo'): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', model);

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getGroqKey()}`,
                },
                body: formData,
            });

            if (response.status === 429 || response.status === 503) {
                rotateKey();
                continue;
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Whisper API HTTP ${response.status}: ${errorBody}`);
            }

            const data = await response.json();
            return data.text || '';
        } catch (error: any) {
            lastError = error;
            rotateKey();
        }
    }

    throw lastError || new Error('SOVEREIGN_ERROR: Whisper transcription failed on all keys.');
}
