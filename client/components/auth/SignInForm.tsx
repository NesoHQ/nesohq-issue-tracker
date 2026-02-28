'use client';

import { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth/client';

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.initiateGitHubOAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Github className="size-8" />
            <span className="text-2xl font-semibold">NesOHQ Issue Tracker</span>
          </div>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground">
            Sign in with your GitHub account to continue
          </p>
        </div>

        {/* Sign in button */}
        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            size="lg"
            className="w-full gap-2"
            disabled={loading}
          >
            <Github className="size-5" />
            {loading ? 'Redirecting...' : 'Sign in with GitHub'}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <p className="text-sm text-center text-muted-foreground px-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Demo features */}
        <div className="pt-8 border-t">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Demo Features:</p>
            <ul className="space-y-1 pl-4">
              <li>• Multi-repository issue management</li>
              <li>• Inline editing and markdown support</li>
              <li>• Advanced filtering and search</li>
              <li>• Image uploads and clipboard paste</li>
              <li>• Draft autosave</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
