import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  eslint: {
    // Enabled for production verifications
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enabled for production type checking
    ignoreBuildErrors: false,
  },
  transpilePackages: ['@solana/web3.js'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    // Ignore internal next-intl parsing warnings for production extractors
    config.ignoreWarnings = [
      { module: /node_modules\/next-intl/ }
    ];
    return config;
  },
};

export default withNextIntl(nextConfig);
