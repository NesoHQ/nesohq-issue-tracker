import { getRepositories } from '@/app/actions/github';
import { getUserFromCookie } from '@/lib/auth/cookies';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import type { Repository } from '@/lib/types';

/**
 * Workspace page - Server Component
 * Fetches initial data on the server, then hydrates client components
 */

export default async function WorkspacePage() {
  // Get user from cookie (set by middleware)
  const user = await getUserFromCookie();
  
  if (!user) {
    redirect(ROUTES.HOME);
  }

  // Fetch repositories on the server
  // This is cached and deduplicated automatically
  let repositories: Repository[] = [];
  try {
    repositories = await getRepositories();
  } catch (error) {
    // Session expired — clear cookies and send back to sign-in
    if (error instanceof Error && error.message.includes('Session expired')) {
      redirect(ROUTES.HOME);
    }
    console.error('Failed to load repositories:', error);
  }

  return (
    <WorkspaceShell 
      user={user} 
      initialRepositories={repositories} 
    />
  );
}
