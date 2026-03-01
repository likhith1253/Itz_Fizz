import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Itz_Fizz',
  assetPrefix: '/Itz_Fizz',
};

export default nextConfig;
