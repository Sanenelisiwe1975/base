import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const lang = locale || 'en'; // fallback to English or your preferred default

  let messages;
  try {
    messages = (await import(`./messages/${lang}.json`)).default;
  } catch (error) {
    console.error(`Missing translation file for locale "${lang}", using "en" fallback.`);
    messages = (await import(`./messages/en.json`)).default;
  }

  return { locale: lang, messages };
});
