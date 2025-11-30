import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['midtrans-client'],
  
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', 
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hhpivhusxadynfuokals.supabase.co', 
        pathname: '/storage/v1/object/public/**', 
      },
    ],
  },
};

export default nextConfig;