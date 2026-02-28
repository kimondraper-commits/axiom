import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude mapbox-gl from SSR bundling (it uses browser APIs)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "mapbox-gl"];
    }
    return config;
  },
};

export default nextConfig;
