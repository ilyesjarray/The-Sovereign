import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { LocaleHtmlAttributes } from '@/components/LocaleHtmlAttributes';
import { MarketProvider } from '@/providers/MarketProvider';
import { VocalProvider } from '@/providers/VocalProvider';

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return [{ locale: 'en' }];
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    setRequestLocale(locale);
    const messages = await getMessages();
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <MarketProvider>
                <VocalProvider>
                    <LocaleHtmlAttributes locale={locale} dir="ltr" />
                    {children}
                </VocalProvider>
            </MarketProvider>
        </NextIntlClientProvider>
    );
}
