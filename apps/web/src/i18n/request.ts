import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Static export requires the locale to be available during build
  // We await it here as per next-intl docs for Next.js 15
  let locale = await requestLocale;

  // Ensure the locale is supported, otherwise fallback to default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
