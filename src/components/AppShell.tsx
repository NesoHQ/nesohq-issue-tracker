import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import RepoSelectorSidebar from './RepoSelectorSidebar'

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <RepoSelectorSidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
