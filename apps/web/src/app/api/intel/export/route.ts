import { NextResponse } from 'next/server';

// PDF Export route using plain HTML → UTF-8 text
// For a full PDF, integrate a library like @react-pdf/renderer server-side
export async function POST(req: Request) {
    try {
        const { type, data } = await req.json();
        // type: 'intelligence' | 'market' | 'signals'

        const now = new Date().toLocaleString('en-US', {
            timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short'
        });

        let csvContent = '';
        let filename = '';

        if (type === 'intelligence' && data?.reports) {
            filename = `sovereign-intel-${Date.now()}.csv`;
            csvContent = 'Timestamp,Type,Level,Content\n' +
                data.reports.map((r: any) =>
                    `"${r.created_at || now}","${r.scout_type || 'NEWS'}","${r.intel_level || 'INFO'}","${(r.content || r.description || '').replace(/"/g, '""')}"`
                ).join('\n');
        } else if (type === 'market' && data?.assets) {
            filename = `sovereign-market-${Date.now()}.csv`;
            csvContent = 'Asset,Price,24h Change,Status\n' +
                data.assets.map((a: any) =>
                    `"${a.name}","${a.value}","${a.growth}","${a.status}"`
                ).join('\n');
        } else if (type === 'signals' && data?.signals) {
            filename = `sovereign-signals-${Date.now()}.csv`;
            csvContent = 'Asset,Signal,Confidence,Reason,Target,StopLoss\n' +
                data.signals.map((s: any) =>
                    `"${s.asset}","${s.signal}","${s.confidence}%","${(s.reason || '').replace(/"/g, '""')}","${s.target}","${s.stopLoss}"`
                ).join('\n');
        } else {
            return NextResponse.json({ error: 'Invalid export type or data' }, { status: 400 });
        }

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
