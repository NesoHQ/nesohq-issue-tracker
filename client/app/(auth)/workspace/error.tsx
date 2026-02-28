'use client';

/**
 * Error boundary for workspace page
 * Catches errors in server components and provides recovery
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Workspace error:', error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred while loading your workspace.'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
