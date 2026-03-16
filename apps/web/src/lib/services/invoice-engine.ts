'use client';

export type SupportedLanguage = 'AR' | 'EN' | 'FR';

export interface InvoiceData {
    invoiceId: string;
    clientId: string;
    clientName: string;
    date: string;
    items: Array<{ description: string; amount: number; quantity: number }>;
    totalAmount: number;
    currency: string;
}

const TEMPLATES: Record<SupportedLanguage, any> = {
    EN: {
        title: 'SOVEREIGN_INVOICE',
        idLabel: 'INVOICE_ID',
        dateLabel: 'ISSUED_DATE',
        totalLabel: 'TOTAL_DUE',
        statusActive: 'DEPOSIT_CONFIRMED',
        descriptionLabel: 'ASSET_DESCRIPTION',
    },
    AR: {
        title: 'فاتورة_سيادية',
        idLabel: 'رقم_الفاتورة',
        dateLabel: 'تاريخ_الإصدار',
        totalLabel: 'المبلغ_الإجمالي',
        statusActive: 'تم_تأكيد_الإيداع',
        descriptionLabel: 'وصف_الأصل',
    },
    FR: {
        title: 'FACTURE_SOUVERAINE',
        idLabel: 'ID_FACTURE',
        dateLabel: 'DATE_ÉMISSION',
        totalLabel: 'TOTAL_DUE',
        statusActive: 'DÉPÔT_CONFIRMÉ',
        descriptionLabel: 'DESCRIPTION_ACTIF',
    }
};

export class InvoiceEngine {
    static generateMockPDF(data: InvoiceData, lang: SupportedLanguage = 'EN') {
        const template = TEMPLATES[lang];
        console.log(`[InvoiceEngine] Generating ${lang} document for ${data.invoiceId}`);

        // In a real implementation, this would use jspdf or a server-side engine like puppeteer.
        // Here we simulate the metadata for a PDF download.
        const content = `
            ${template.title}
            ----------------------------
            ${template.idLabel}: ${data.invoiceId}
            ${template.dateLabel}: ${data.date}
            
            ${template.descriptionLabel} | AMOUNT
            ${data.items.map(item => `${item.description} | ${item.amount * item.quantity}`).join('\n')}
            
            ----------------------------
            ${template.totalLabel}: ${data.currency} ${data.totalAmount}
            STATUS: ${template.statusActive}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        return URL.createObjectURL(blob);
    }

    static formatCurrency(amount: number, lang: SupportedLanguage = 'EN') {
        const locales = { AR: 'ar-SA', EN: 'en-US', FR: 'fr-FR' };
        return new Intl.NumberFormat(locales[lang], {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
}
