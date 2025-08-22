/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['violet-rainy-toad-577.mypinata.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Remove experimental features that might cause build issues
  webpack: (config, { isServer }) => {
    // Fix for potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
