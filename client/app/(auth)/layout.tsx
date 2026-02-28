import type { Metadata } from 'next';

/**
 * Layout for authenticated routes
 * Could add shared navigation, headers, etc.
 */

export const metadata: Metadata = {
  title: 'Workspace | NesOHQ Issue Tracker',
  description: 'Manage your GitHub issues',
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
