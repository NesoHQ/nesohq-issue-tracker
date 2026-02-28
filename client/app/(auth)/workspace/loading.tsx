import { Loader2 } from 'lucide-react';

/**
 * Loading UI for workspace page
 * Shown while server component is fetching data
 */

export default function WorkspaceLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="size-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    </div>
  );
}
