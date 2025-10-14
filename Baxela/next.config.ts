import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'af', 'nr', 'nso', 'st', 'ss', 'ts', 'tn', 've', 'xh', 'zu'],
    defaultLocale: 'en'
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
export default withNextIntl(nextConfig);