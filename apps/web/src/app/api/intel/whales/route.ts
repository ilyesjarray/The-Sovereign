import { NextResponse } from 'next/server';

export async function GET() {
    // Simulated Whale Movement Data
    const whales = [
        {
            id: 'w1',
            asset: 'BTC',
            amount: 450.5,
            value: 450.5 * 96000,
            from: 'Unknown_Wallet_0x712...',
            to: 'Coinbase_Hot_Wallet',
            type: 'EXCHANGE_INFLOW',
            timestamp: new Date().toISOString()
        },
        {
            id: 'w2',
            asset: 'ETH',
            amount: 12000,
            value: 12000 * 2500,
            from: 'Binance_Whale_0x992...',
            to: 'Cold_Storage_Vault',
            type: 'EXCHANGE_OUTFLOW',
            timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
            id: 'w3',
            asset: 'SOL',
            amount: 150000,
            value: 150000 * 180,
            from: 'Phantom_User_9WzD...',
            to: 'Jupiter_Aggregator',
            type: 'LIQUIDITY_ADD',
            timestamp: new Date(Date.now() - 600000).toISOString()
        },
        {
            id: 'w4',
            asset: 'BTC',
            amount: 890,
            value: 890 * 96000,
            from: 'Kraken_Account_0x112...',
            to: 'Unknown_Whale_0x554...',
            type: 'TRANSFER',
            timestamp: new Date(Date.now() - 1200000).toISOString()
        }
    ];

    return NextResponse.json(whales);
}
