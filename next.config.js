/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: [
        'chrome-aws-lambda',
        'puppeteer-core'
      ]
    }
  };
  
  module.exports = nextConfig;
  