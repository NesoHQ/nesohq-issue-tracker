import type { Metadata } from 'next';

/**
 * Layout for public routes (sign in, etc.)
 * Minimal layout without navigation
 */

export const metadata: Metadata = {
  title: 'Sign In | NesOHQ Issue Tracker',
  description: 'Sign in with GitHub to manage your issues',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
