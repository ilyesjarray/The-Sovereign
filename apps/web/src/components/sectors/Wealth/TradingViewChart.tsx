'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot
} from 'recharts';

interface ChartData {
    time: string;
    price: number;
    action?: 'BUY' | 'SELL';
}

const generateMockData = () => {
    const data: ChartData[] = [];
    let basePrice = 45000;
    for (let i = 0; i < 30; i++) {
        const change = (Math.random() - 0.45) * 500;
        basePrice += change;
        data.push({
            time: `${i}:00`,
            price: parseFloat(basePrice.toFixed(2)),
            // Add some mock trade markers
            action: i === 10 ? 'BUY' : i === 22 ? 'SELL' : undefined
        });
    }
    return data;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 border border-hyper-cyan/30 p-3 rounded-lg backdrop-blur-md shadow-neon-cyan/20">
                <p className="text-[10px] text-white/40 uppercase font-black mb-1">Packet_Time: {payload[0].payload.time}</p>
                <p className="text-sm font-black text-hyper-cyan italic">${payload[0].value.toLocaleString()}</p>
                {payload[0].payload.action && (
                    <p className={`text-[9px] font-black mt-2 uppercase ${payload[0].payload.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Protocol_Executed: {payload[0].payload.action}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export function TradingViewChart() {
    const [data, setData] = React.useState<ChartData[]>([]);

    React.useEffect(() => {
        setData(generateMockData());
    }, []);

    return (
        <div className="w-full h-[350px] relative mt-6 group">
            <div className="absolute top-4 left-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live_Market_Feed // BTC_USD</span>
                </div>
            </div>

            {data.length > 0 && (

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F3FF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00F3FF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="time"
                            hide
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 900 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val: number) => `$${val / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#00F3FF"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={2000}
                        />

                        {/* Render execution markers */}
                        {data.filter(d => d.action).map((d, i) => (
                            <ReferenceDot
                                key={i}
                                x={d.time}
                                y={d.price}
                                r={6}
                                fill={d.action === 'BUY' ? '#10b981' : '#f43f5e'}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            )}

            {/* Decorative Grid Overlays */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl overflow-hidden opacity-30">
                <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-white/5" />
                <div className="absolute top-0 bottom-0 left-2/4 w-[1px] bg-white/5" />
                <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-white/5" />
            </div>
        </div>
    );
}
