import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

/**
 * 404 Not Found page
 */

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <FileQuestion className="size-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
