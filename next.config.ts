// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep any other existing configurations you have uncommented
  // reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: [
      '@react-email/render',
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },

  webpack(config, { dev, isServer }) {
    // ignoreWarnings stays as you had it
    if (dev) {
      config.ignoreWarnings = config.ignoreWarnings || [];
      config.ignoreWarnings.push({
        message: /unreachable code after return statement/,
      });
    }

    // **NEW**: alias the server entrypoint to the browser one so
    // renderToReadableStream is available on Node.js builds
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        'react-dom/server': 'react-dom/server.browser',
      };
    }

    return config;
  },

  // any other Next.js config…
};

export default nextConfig;
