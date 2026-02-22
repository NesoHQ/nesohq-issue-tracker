import { useState, useEffect } from 'react';
import { Repository, Issue } from '../lib/types';
import { authService } from '../lib/auth';
import { githubApi } from '../lib/github-api';
import { RepositorySidebar } from './RepositorySidebar';
import { IssueList } from './IssueList';
import { IssueDetail } from './IssueDetail';
import { CreateIssue } from './CreateIssue';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Github, Moon, Sun, LogOut, Settings, User, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster } from './ui/sonner';

type View = 'issues' | 'create' | 'detail';

export function Workspace() {
  const { theme, setTheme } = useTheme();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [view, setView] = useState<View>('issues');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailPanelSize, setDetailPanelSize] = useState(40);

  const user = authService.getUser();

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const repos = await githubApi.getRepositories();
      setRepositories(repos);
      // Auto-select first repository
      if (repos.length > 0) {
        setSelectedRepo(repos[0].id);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setView('detail');
  };

  const handleCreateClick = () => {
    setView('create');
  };

  const handleCloseDetail = () => {
    setSelectedIssue(null);
    setView('issues');
  };

  const handleIssueCreated = (issue: Issue) => {
    setSelectedIssue(issue);
    setView('detail');
  };

  const handleIssueUpdated = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleIssueDeleted = () => {
    setSelectedIssue(null);
    setView('issues');
  };

  const handleSignOut = () => {
    authService.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster />
      
      {/* Top bar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-3">
          <Github className="size-6" />
          <h1 className="text-lg font-semibold">NesOHQ Issue Tracker</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="size-9 p-0"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={user?.avatar_url} alt={user?.login} />
                  <AvatarFallback>{user?.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.login}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="size-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="size-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Repository sidebar */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
          >
            <RepositorySidebar
              repositories={repositories}
              selectedRepo={selectedRepo}
              onSelectionChange={setSelectedRepo}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Issue list */}
          <ResizablePanel defaultSize={view === 'detail' ? 60 - detailPanelSize : 80} minSize={30}>
            {view === 'issues' && (
              <IssueList
                selectedRepo={selectedRepo}
                selectedIssueId={selectedIssue?.id}
                onIssueSelect={handleIssueSelect}
                onCreateClick={handleCreateClick}
              />
            )}
            {view === 'create' && (
              <CreateIssue
                repositories={repositories}
                defaultRepoFullName={selectedRepo}
                onClose={handleCloseDetail}
                onSuccess={handleIssueCreated}
              />
            )}
            {view === 'detail' && selectedIssue && (
              <IssueList
                selectedRepo={selectedRepo}
                selectedIssueId={selectedIssue.id}
                onIssueSelect={handleIssueSelect}
                onCreateClick={handleCreateClick}
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