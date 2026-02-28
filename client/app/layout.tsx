import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import '@/styles/globals.css';

/**
 * Root layout - wraps all pages
 * Optimized fonts, theme provider, and global styles
 */

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'NesOHQ Issue Tracker',
    template: '%s | NesOHQ Issue Tracker',
  },
  description: 'Manage your GitHub issues with ease across all repositories',
  keywords: ['GitHub', 'Issues', 'Project Management', 'Developer Tools'],
  authors: [{ name: 'NesOHQ' }],
  creator: 'NesOHQ',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'NesOHQ Issue Tracker',
    description: 'Manage your GitHub issues with ease',
    siteName: 'NesOHQ Issue Tracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NesOHQ Issue Tracker',
    description: 'Manage your GitHub issues with ease',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
