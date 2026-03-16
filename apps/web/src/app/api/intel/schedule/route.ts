import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const MODEL_NAME = 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
    try {
        const { tasks, date } = await req.json();

        if (!tasks) {
            return NextResponse.json({ error: 'Tasks required' }, { status: 400 });
        }

        if (!GROQ_API_KEY || GROQ_API_KEY.length < 10) {
            return NextResponse.json({ error: 'GROQ_API_KEY not configured.' }, { status: 503 });
        }

        const prompt = `You are a highly efficient, military-grade AI executive assistant ('Chronos Engine').
The user wants to schedule the following list of tasks on this date: ${date}.
Tasks/Notes:
"""
${tasks}
"""
Analyze the tasks and create a structured schedule for the day between 08:00 and 22:00.
Determine the most logical order, duration, and assign a category for each task from this list: OPERATION, MISSION, REST, STRATEGIC.

Respond ONLY with a valid JSON array of objects. Do not wrap in markdown blocks like \`\`\`json. Just the array.
Each object must have:
- title: string (concise, uppercase, max 30 chars)
- start_time: string (ISO 8601 format, e.g., "${date}T10:00:00" using the requested date)
- end_time: string (ISO 8601 format)
- category: string (one of the allowed strings)
`;

        const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 1000
            })
        });

        if (!aiRes.ok) {
            throw new Error('Chronos AI core failure');
        }

        const data = await aiRes.json();
        let jsonStr = data.choices[0].message.content.trim();

        // Cleanup if the AI still included markdown
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '');
        jsonStr = jsonStr.trim();

        const schedule = JSON.parse(jsonStr);

        return NextResponse.json({ schedule });

    } catch (e: any) {
        console.error('Chronos scheduling error', e);
        return NextResponse.json({ error: 'Chronos Engine failed to synchronize temporal data' }, { status: 500 });
    }
}
