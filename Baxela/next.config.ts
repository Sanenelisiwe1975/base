import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  i18n: {
    locales: ['en', 'fr'], // 👈 add all supported locales
    defaultLocale: 'en',
  },
  
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default withNextIntl(nextConfig);