// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep any other existing configurations you have uncommented
  // reactStrictMode: true, // Example

  images: {
    // Keep your configuration for next/image optimization.
    // This is separate from CSP header blocking.
    // Note: If you want to use <Image> component optimization for the
    // dynamic webshop images, you would *also* need to add their hostnames
    // here. Doing that dynamically in this config file is complex, so you
    // might just use regular <img> tags for the dynamic webshop images
    // (like in the ProductImage component example) which will rely solely
    // on the CSP header set in middleware.ts for loading permission.
    remotePatterns: [
      // Keep patterns for images you *know* you'll use with next/image
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        // Removed port and pathname duplicates if not needed, simplified:
        // port: '', // Usually not needed for https
        // pathname: '/:path*', // This covers /anon_* as well
      },
      // Add other *known* hosts for next/image optimization here if needed
    ],
    // Deprecated 'domains' is less preferred than remotePatterns
    // domains: ['avatar.vercel.sh'], // You can likely remove this if using remotePatterns
  },

  // Remove the async headers() function entirely, as CSP and other
  // security headers are now set dynamically in middleware.ts
  /*
  async headers() {
    // THIS BLOCK IS REMOVED OR COMMENTED OUT
    return [
      {
        source: '/(.*)', // Or specific paths
        headers: [
          // { key: 'Content-Security-Policy', value: '...' }, // REMOVED
          // { key: 'X-Content-Type-Options', value: 'nosniff' }, // REMOVED (handled in middleware)
          // ... other headers also moved to middleware ...
        ],
      },
    ];
  },
  */

  // Keep your webpack configuration
  webpack(config, { dev, isServer }) { // Added isServer for context if needed later
    if (dev) {
      config.ignoreWarnings = config.ignoreWarnings || [];
      config.ignoreWarnings.push({
        message: /unreachable code after return statement/,
      });
    }
    // You can add other webpack customizations here
    return config;
  },

  // Add any other Next.js configurations you need here
  // e.g., env variables, redirects, rewrites, etc.

};

export default nextConfig;