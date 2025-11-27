import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['midtrans-client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hhpivhusxadynfuokals.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
    ],
  },
};

export default nextConfig;