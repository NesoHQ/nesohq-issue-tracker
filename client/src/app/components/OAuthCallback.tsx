import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authService } from '../lib/auth';

export function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const oauthError = params.get('error');
      const oauthErrorDescription = params.get('error_description');

      if (oauthError) {
        setErrorMessage(oauthErrorDescription || oauthError);
        setStatus('error');
        return;
      }

      if (!code) {
        setErrorMessage('Missing authorization code');
        setStatus('error');
        return;
      }

      try {
        await authService.completeGitHubOAuth(code, state);
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/workspace';
        }, 1000);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="size-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Completing sign in...</h2>
            <p className="text-muted-foreground">Please wait while we authenticate you</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold">Success!</h2>
            <p className="text-muted-foreground">Redirecting to your workspace...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">✗</span>
            </div>
            <h2 className="text-xl font-semibold">Authentication failed</h2>
            <p className="text-muted-foreground">{errorMessage || 'Please try again'}</p>
            <a href="/" className="text-primary hover:underline inline-block mt-4">
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
