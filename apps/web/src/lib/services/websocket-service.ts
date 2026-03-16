'use client';

export interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: number;
}

type PriceCallback = (update: PriceUpdate) => void;

export class WebSocketService {
    private static instance: WebSocketService;
    private connections: Map<string, WebSocket> = new Map();
    private subscribers: Map<string, Set<PriceCallback>> = new Map();
    private reconnectAttempts: Map<string, number> = new Map();
    private maxReconnectAttempts = 5;

    public static getInstance() {
        if (!this.instance) this.instance = new WebSocketService();
        return this.instance;
    }

    subscribe(symbol: string, callback: PriceCallback) {
        const normalizedSymbol = symbol.toUpperCase();

        if (!this.subscribers.has(normalizedSymbol)) {
            this.subscribers.set(normalizedSymbol, new Set());
        }

        this.subscribers.get(normalizedSymbol)!.add(callback);

        if (!this.connections.has(normalizedSymbol)) {
            this.connect(normalizedSymbol);
        }

        return () => this.unsubscribe(normalizedSymbol, callback);
    }

    private unsubscribe(symbol: string, callback: PriceCallback) {
        const subs = this.subscribers.get(symbol);
        if (subs) {
            subs.delete(callback);
            if (subs.size === 0) {
                this.disconnect(symbol);
            }
        }
    }

    private connect(symbol: string) {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@trade`;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log(`[WebSocket]: Connected to ${symbol}`);
                this.reconnectAttempts.set(symbol, 0);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const update: PriceUpdate = {
                        symbol: symbol,
                        price: parseFloat(data.p),
                        timestamp: data.T
                    };

                    this.notifySubscribers(symbol, update);
                } catch (error) {
                    console.error(`[WebSocket]: Parse error for ${symbol}`, error);
                }
            };

            ws.onerror = (error) => {
                console.error(`[WebSocket]: Error for ${symbol}`, error);
            };

            ws.onclose = () => {
                console.log(`[WebSocket]: Disconnected from ${symbol}`);
                this.connections.delete(symbol);
                this.attemptReconnect(symbol);
            };

            this.connections.set(symbol, ws);
        } catch (error) {
            console.error(`[WebSocket]: Failed to connect to ${symbol}`, error);
        }
    }

    private disconnect(symbol: string) {
        const ws = this.connections.get(symbol);
        if (ws) {
            ws.close();
            this.connections.delete(symbol);
        }
        this.subscribers.delete(symbol);
    }

    private attemptReconnect(symbol: string) {
        const attempts = this.reconnectAttempts.get(symbol) || 0;

        if (attempts < this.maxReconnectAttempts && this.subscribers.get(symbol)?.size) {
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            console.log(`[WebSocket]: Reconnecting to ${symbol} in ${delay}ms (attempt ${attempts + 1})`);

            setTimeout(() => {
                this.reconnectAttempts.set(symbol, attempts + 1);
                this.connect(symbol);
            }, delay);
        }
    }

    private notifySubscribers(symbol: string, update: PriceUpdate) {
        const subs = this.subscribers.get(symbol);
        if (subs) {
            subs.forEach(callback => callback(update));
        }
    }

    disconnectAll() {
        this.connections.forEach((ws, symbol) => {
            ws.close();
        });
        this.connections.clear();
        this.subscribers.clear();
    }
}
