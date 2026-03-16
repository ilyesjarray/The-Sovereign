export interface VerifiedInformation {
    id: string;
    content: string;
    source: string;
    sourceUrl: string;
    timestamp: string;
    verificationStatus: 'VERIFIED' | 'PENDING' | 'SECURE';
    category: 'GEOPOLITICAL' | 'FINANCIAL' | 'SECURITY';
}

export class VerifiedDataService {
    static getInstitutionalStream(): VerifiedInformation[] {
        return [
            {
                id: 'V-8821',
                content: 'KSA Sovereign Wealth Fund signals 50B allocation to AI infrastructure.',
                source: 'REUTERS_TERMINAL',
                sourceUrl: 'https://reuters.com/finance/ksa-ai-allocation',
                timestamp: new Date().toISOString(),
                verificationStatus: 'VERIFIED',
                category: 'FINANCIAL'
            },
            {
                id: 'V-9932',
                content: 'Orbital Surveillance detects unusual energy signatures in Sector 7G.',
                source: 'IMPERIAL_SATELLITE_LINK',
                sourceUrl: '#',
                timestamp: new Date().toISOString(),
                verificationStatus: 'SECURE',
                category: 'GEOPOLITICAL'
            },
            {
                id: 'V-1105',
                content: 'Brent Crude hits $84.20 following supply-chain disruption alerts.',
                source: 'BLOOMBERG_LIVE',
                sourceUrl: 'https://bloomberg.com/markets/oil-update',
                timestamp: new Date().toISOString(),
                verificationStatus: 'VERIFIED',
                category: 'FINANCIAL'
            }
        ];
    }
}
