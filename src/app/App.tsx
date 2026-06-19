import { useEffect, useState } from 'react'
import { AdminPage } from '../features/admin/AdminPage'
import { PublicSite } from './PublicSite'

export function App() {
  const [path, setPath] = useState(window.location.pathname)

  const navigate = (nextPath: string) => {
    window.history.pushState(null, '', nextPath)
    setPath(nextPath)
  }

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (path.startsWith('/admin')) {
    return <AdminPage onNavigate={navigate} />
  }

  return <PublicSite currentPath={path} onNavigate={navigate} />
}
