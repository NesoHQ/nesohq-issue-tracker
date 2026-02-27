import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import '../src/styles/index.css';

export const metadata: Metadata = {
  title: 'NesOHQ Issue Tracker',
  description: 'Manage your GitHub issues with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
