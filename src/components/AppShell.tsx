import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import RepoSelectorSidebar from './RepoSelectorSidebar'

export default function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <RepoSelectorSidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
