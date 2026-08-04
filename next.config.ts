import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/sponsor-pitch-generator',
        destination: '/tools/sponsor-pitch-generator',
        permanent: true,
      },
      {
        source: '/algo-hook-generator',
        destination: '/tools/algo-hook-generator',
        permanent: true,
      },
      {
        source: '/hook-generator',
        destination: '/tools/hook-generator',
        permanent: true,
      },
      {
        source: '/bpm-calculator',
        destination: '/tools/tempo-calculator',
        permanent: true,
      },
      {
        source: '/thumbnail-text-generator',
        destination: '/tools/thumbnail-text-generator',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
