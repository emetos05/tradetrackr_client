/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};

export default nextConfig;
