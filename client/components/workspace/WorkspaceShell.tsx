'use client';

/**
 * Workspace shell - main layout for authenticated workspace
 * Client component that manages workspace state and layout
 */

import { useState, useCallback } from 'react';
import { WorkspaceHeader } from './WorkspaceHeader';
import { RepositorySidebar } from './RepositorySidebar';
import { IssueList } from '@/components/issues/IssueList';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { CreateIssueForm } from '@/components/issues/CreateIssueForm';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/sonner';
import type { Repository, Issue, User } from '@/lib/types';

type View = 'issues' | 'create' | 'detail';

interface WorkspaceShellProps {
  user: User;
  initialRepositories: Repository[];
}

export function WorkspaceShell({ user, initialRepositories }: WorkspaceShellProps) {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(
    initialRepositories[0]?.id ?? null
  );
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [view, setView] = useState<View>('issues');
  const [detailPanelSize, setDetailPanelSize] = useState(40);

  const handleIssueSelect = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    setView('detail');
  }, []);

  const handleCreateClick = useCallback(() => {
    setView('create');
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedIssue(null);
    setView('issues');
  }, []);

  const handleIssueCreated = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    setView('detail');
  }, []);

  const handleIssueUpdated = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleIssueDeleted = useCallback(() => {
    setSelectedIssue(null);
    setView('issues');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster />
      
      {/* Top bar */}
      <WorkspaceHeader user={user} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Repository sidebar */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
          >
            <RepositorySidebar
              repositories={initialRepositories}
              selectedRepo={selectedRepo}
              onSelectionChange={setSelectedRepo}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Issue list — always mounted so state/data is never lost on view changes */}
          <ResizablePanel defaultSize={80} minSize={30}>
            {/* Hidden (not unmounted) when the create form is open */}
            <div className={view === 'create' ? 'hidden' : 'h-full'}>
              <IssueList
                selectedRepo={selectedRepo}
                selectedIssueId={selectedIssue?.id}
                onIssueSelect={handleIssueSelect}
                onCreateClick={handleCreateClick}
                patchIssue={selectedIssue ?? undefined}
              />
            </div>
            {view === 'create' && (
              <CreateIssueForm
                repositories={initialRepositories}
                defaultRepoFullName={selectedRepo}
                onClose={handleCloseDetail}
                onSuccess={handleIssueCreated}
              />
            )}
          </ResizablePanel>

          {/* Issue detail panel */}
          {view === 'detail' && selectedIssue && (
            <>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={detailPanelSize}
                minSize={30}
                maxSize={60}
                onResize={setDetailPanelSize}
              >
                <IssueDetail
                  issue={selectedIssue}
                  onClose={handleCloseDetail}
                  onUpdate={handleIssueUpdated}
                  onDelete={handleIssueDeleted}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
