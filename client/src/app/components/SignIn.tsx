'use client';

import { authService } from '../lib/auth';
import { Button } from './ui/button';
import { Github } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await authService.initiateGitHubOAuth();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc3MTY2NjExOXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Github className="size-8" />
            <span className="text-2xl font-semibold">NesOHQ Issue Tracker</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground">
            Manage your GitHub issues with ease
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Track, organize, and collaborate on issues across all your repositories in one unified workspace.
          </p>
          <div className="flex flex-col gap-4 pt-8">
            <div className="flex items-start gap-3 text-primary-foreground/90">
              <div className="size-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <div className="font-medium">Multi-repository view</div>
                <div className="text-sm opacity-80">See all your issues in one place</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-primary-foreground/90">
              <div className="size-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <div className="font-medium">Advanced filtering</div>
                <div className="text-sm opacity-80">Find exactly what you need</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-primary-foreground/90">
              <div className="size-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <div className="font-medium">Rich editing experience</div>
                <div className="text-sm opacity-80">Markdown support with live preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
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

            {errorMessage && (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}

            <p className="text-sm text-center text-muted-foreground px-8">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              OAuth and media upload are powered by the server.
            </p>
          </div>

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
    </div>
  );
}
