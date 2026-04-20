import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/loading-screen'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen title="Checking your session" description="Pulling your personal event dashboard together." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
