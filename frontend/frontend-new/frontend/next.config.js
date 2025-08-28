/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
  // Enhanced configuration for Netlify deployment
  webpack: (config, { isServer }) => {
    // Fix for potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Ensure styled-jsx is properly handled
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'styled-jsx/style': require.resolve('styled-jsx/style'),
      };
    }
    
    return config;
  },
  // Experimental features for better compatibility
  experimental: {
    esmExternals: false,
  },
  // Optimize for serverless functions
  output: 'standalone',
}

module.exports = nextConfig
