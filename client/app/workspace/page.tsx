'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../src/app/lib/auth';
import { Workspace } from '../../src/app/components/Workspace';

export default function WorkspacePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      router.replace('/');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <Workspace />;
}
