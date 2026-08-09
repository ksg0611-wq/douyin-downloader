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
      {
        source: '/script-framework',
        destination: '/tools/script-framework',
        permanent: true,
      },
      {
        source: '/blog/ga4-marketing-data-analysis',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/firebase-serverless-marketing-webapp',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/seasonal-high-ticket-cpa-keywords',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/adsense-approval-seo-structure',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/adsense-placement-optimization-webapp',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/technical-seo-information-processing',
        destination: '/blog',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
