// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // …other config…

  images: {
    // Option A: simple domains list
    domains: ['avatar.vercel.sh'],

    // If you still need remotePatterns for other hosts, keep them:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/:path*',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/:path*',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/anon_*',
      },
      // …any other existing patterns…
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:"
                + " https://js.stripe.com"
                + " https://checkout.stripe.com"
                + " https://js.stripe.network"
                + " https://m.stripe.network"
                + " https://hcaptcha.com https://*.hcaptcha.com"
                + " https://va.vercel-scripts.com"
                + " https://editor.unlayer.com;",
              "style-src 'self' 'unsafe-inline'"
                + " https://js.stripe.com"
                + " https://checkout.stripe.com"
                + " https://js.stripe.network"
                + " https://m.stripe.network"
                + " https://hcaptcha.com https://*.hcaptcha.com"
                + " https://editor.unlayer.com;",
              "img-src 'self' data: blob:"
                + " https://i.pravatar.cc"
                + " https://stripe-camo.global.ssl.fastly.net"
                + " https://d1wqzb5bdbcre6.cloudfront.net"
                + " *.stripe.com;",
              "connect-src 'self'"
                + " https://api.stripe.com"
                + " https://checkout.stripe.com"
                + " https://js.stripe.network"
                + " https://m.stripe.network"
                + " https://hcaptcha.com https://*.hcaptcha.com"
                + " https://va.vercel-scripts.com"
                + " https://api.iconify.design"
                + " https://api.unisvg.com"
                + " https://api.simplesvg.com;",
              "frame-src 'self'"
                + " https://js.stripe.com"
                + " https://checkout.stripe.com"
                + " https://js.stripe.network"
                + " https://m.stripe.network"
                + " https://hcaptcha.com https://*.hcaptcha.com"
                + " https://editor.unlayer.com;",
              "frame-ancestors 'self';",
            ].join(' '),
          },
        ],
      },
    ];
  },

  // Suppress unreachable‐code warnings in dev build
  webpack(config, { dev }) {
    if (dev) {
      config.ignoreWarnings = config.ignoreWarnings || [];
      config.ignoreWarnings.push({
        message: /unreachable code after return statement/,
      });
    }
    return config;
  },
};

export default nextConfig;
