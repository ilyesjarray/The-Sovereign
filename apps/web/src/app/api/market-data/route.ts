import { NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/services/market-data';

export async function POST() {
    const data = await getMarketStats();
    return NextResponse.json(data);
}
