import Decimal from 'decimal.js';

export interface ArbitrageParams {
    priceA: number;
    priceB: number;
    feesA: number;
    feesB: number;
    gasCost?: number;
    slippage?: number;
}

export class ArbitrageEngine {
    /**
     * Calculates net arbitrage profit with high precision.
     * Logic: (PriceB - PriceA) - (FeesA + FeesB + Gas + (Slippage Proxy))
     */
    static calculateNetProfit(params: ArbitrageParams): {
        grossSpread: number;
        netProfit: number;
        isProfitable: boolean;
    } {
        const pA = new Decimal(params.priceA);
        const pB = new Decimal(params.priceB);
        const fA = new Decimal(params.feesA);
        const fB = new Decimal(params.feesB);
        const gas = new Decimal(params.gasCost || 0);
        const slip = new Decimal(params.slippage || 0.001); // 0.1% default slippage proxy

        const grossSpread = pB.minus(pA);

        // Total costs including fees, gas and technical slippage
        const totalCosts = fA.plus(fB).plus(gas).plus(pA.times(slip));

        const netProfit = grossSpread.minus(totalCosts);

        return {
            grossSpread: grossSpread.toNumber(),
            netProfit: netProfit.toNumber(),
            isProfitable: netProfit.gt(0),
        };
    }

    /**
     * Identifies opportunities between assets.
     */
    static analyzePair(assetA: string, assetB: string, priceA: number, priceB: number) {
        // In a real scenario, fees would be dynamic based on the exchange/network
        const result = this.calculateNetProfit({
            priceA,
            priceB,
            feesA: priceA * 0.001, // 0.1% exchange fee
            feesB: priceB * 0.001,
            gasCost: 0, // Simplified for now
        });

        return result;
    }
}
