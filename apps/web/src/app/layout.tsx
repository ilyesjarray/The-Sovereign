import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { RoyalWallpaper } from '@/components/ui/RoyalWallpaper';
import { SovereignTerminal } from '@/components/ui/SovereignTerminal';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'The Sovereign | Intelligence Command',
  description: 'Military-grade Intelligence & Personal Sovereignty Station.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icon.png',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased text-sovereign-blue bg-black`}
      >
        <Providers>
          <RoyalWallpaper />
          <SovereignTerminal />
          <div className="relative z-10 w-full min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
