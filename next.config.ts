import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // enable per‑route pre‑rendering
    ppr: true,
    // allow these external packages in RSC
    serverComponentsExternalPackages: [
      'chrome-aws-lambda',
      'puppeteer-core',
    ],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
