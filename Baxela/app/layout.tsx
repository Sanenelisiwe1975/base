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

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-gray-800">
        <header className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Your App Name</h1>
        </header>
        <main className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
          {children}
        </main>
        <footer className="text-center py-6 text-gray-500">
          &copy; 2024 Your App Name
        </footer>
      </body>
    </html>
  );
}