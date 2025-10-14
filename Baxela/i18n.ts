import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const lang = locale || 'en'; // 👈 default fallback
  const messages = (await import(`./messages/${lang}.json`)).default;

  return {
    locale: lang,
    messages
  };
});
