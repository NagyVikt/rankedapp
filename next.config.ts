import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // enable per‑route pre‑rendering
    ppr: true,
    // serverComponentsExternalPackages was here, now removed
  },
  // Moved here:
  serverComponentsExternalPackages: [
    'chrome-aws-lambda',
    'puppeteer-core',
  ],
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;