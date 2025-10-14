import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'af', 'nr', 'nso', 'st', 'ss', 'ts', 'tn', 've', 'xh', 'zu'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)']
};