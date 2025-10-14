import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'af', 'nr', 'nso', 'st', 'ss', 'ts', 'tn', 've', 'xh', 'zu'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/` (e.g. `/en`, `/es`, `/de`, etc.)
    '/(en|es|fr|de|ja|zh|af|nr|nso|st|ss|ts|tn|ve|xh|zu)/:path*'
  ]
};