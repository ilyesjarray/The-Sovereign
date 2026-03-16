'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';

const MarketContext = createContext<null>(null);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const setConnectionStatus = useMarketStore((state: any) => state.setConnectionStatus);
    const updatePrice = useMarketStore.getState().updatePrice;

    // Resilience & Performance Refs
    const retryCount = useRef(0);
    const reconnectTimeout = useRef<NodeJS.Timeout>(null);
    const priceBuffer = useRef<Record<string, number>>({});
    const flushInterval = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        const connect = () => {
            console.log('[Sovereign] Initializing Financial Data Stream...');

            const socket = new WebSocket(BINANCE_WS_URL);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('[Sovereign] Data Stream Established.');
                setConnectionStatus(true);
                retryCount.current = 0; // Reset backoff on successful connection
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (Array.isArray(data)) {
                        data.forEach((ticker) => {
                            if (['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'].includes(ticker.s)) {
                                // Buffer instead of direct update to avoid render storms
                                priceBuffer.current[ticker.s] = parseFloat(ticker.c);
                            }
                        });
                    }
                } catch (error) {
                    console.error('[Sovereign] Stream Parse error:', error);
                }
            };

            socket.onclose = () => {
                setConnectionStatus(false);
                const backoff = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                console.warn(`[Sovereign] Stream Closed. Retrying in ${backoff}ms (Attempt ${retryCount.current + 1})`);

                reconnectTimeout.current = setTimeout(() => {
                    retryCount.current += 1;
                    connect();
                }, backoff);
            };

            socket.onerror = (error) => {
                console.error('[Sovereign] Stream Error:', error);
                socket.close();
            };
        };

        connect();

        // Throttling: Flush buffer to Zustand store every 300ms
        flushInterval.current = setInterval(() => {
            const updates = priceBuffer.current;
            if (Object.keys(updates).length > 0) {
                Object.entries(updates).forEach(([symbol, price]) => {
                    updatePrice(symbol, price);
                });
                priceBuffer.current = {}; // Reset buffer
            }
        }, 300);

        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (flushInterval.current) clearInterval(flushInterval.current);
        };
    }, [setConnectionStatus, updatePrice]);

    return <MarketContext.Provider value={null}>{children}</MarketContext.Provider>;
};

export const useMarketStream = () => useContext(MarketContext);
