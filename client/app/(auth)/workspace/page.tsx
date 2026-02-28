import { getAuthenticatedUser, getRepositories } from '@/app/actions/github';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import type { Repository, User } from '@/lib/types';

/**
 * Workspace page - Server Component
 * Fetches initial data on the server, then hydrates client components
 */

export default async function WorkspacePage() {
  // Validate the session by fetching user identity from GitHub using the access token.
  // We intentionally avoid trusting user profile cookies for identity display.
  const isAuthFailure = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return (
      message.includes('session expired') ||
      message.includes('not authenticated') ||
      message.includes('bad credentials')
    );
  };

  let user: User;
  let repositories: Repository[] = [];
  try {
    user = await getAuthenticatedUser();
    repositories = await getRepositories();
  } catch (error) {
    if (isAuthFailure(error)) {
      redirect(`${ROUTES.AUTH_SESSION_RESET}?next=${encodeURIComponent(ROUTES.HOME)}`);
    }
    throw error;
  }

  return (
    <WorkspaceShell 
      user={user} 
      initialRepositories={repositories} 
    />
  );
}
