'use client';

/**
 * Workspace header with user menu and theme toggle
 * Client component for interactive elements
 */

import { Github, Moon, Sun, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/app/actions/auth';
import type { User } from '@/lib/types';

interface WorkspaceHeaderProps {
  user: User;
}

export function WorkspaceHeader({ user }: WorkspaceHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <Github className="size-6" />
        <h1 className="text-lg font-semibold">NesOHQ Issue Tracker</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="size-9 p-0"
          aria-label="Toggle theme"
        >
          {/* Both icons rendered; CSS shows/hides based on the `dark` class next-themes
              sets on <html> before React hydrates — no hydration mismatch. */}
          <Sun  className="size-4 hidden dark:block" />
          <Moon className="size-4 block  dark:hidden" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="size-6">
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback>{user.login[0]?.toUpperCase() ?? '?'}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.login}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserIcon className="size-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
