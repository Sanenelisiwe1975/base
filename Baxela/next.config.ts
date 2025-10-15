/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'webworker-threads': false,
        'pino-pretty': false,
      };
    }

    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/natural/ },
      { module: /node_modules\/pino/ },
    ];

    return config;
  },
};

export default nextConfig;