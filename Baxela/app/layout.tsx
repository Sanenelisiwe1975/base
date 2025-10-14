

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params; // ✅ await first

  return (
    <html lang={locale}>
      <body>{props.children}</body>
    </html>
  );
}
