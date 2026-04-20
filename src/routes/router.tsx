/* eslint-disable react-refresh/only-export-components */

import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/loading-screen'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SiteLayout } from '@/components/layout/site-layout'
import { ProtectedRoute } from '@/routes/protected-route'

const LandingPage = lazy(() => import('@/pages/landing-page'))
const DiscoverPage = lazy(() => import('@/pages/discover-page'))
const EventDetailPage = lazy(() => import('@/pages/event-detail-page'))
const CommunitiesPage = lazy(() => import('@/pages/communities-page'))
const CommunityDetailPage = lazy(() => import('@/pages/community-detail-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const SignupPage = lazy(() => import('@/pages/signup-page'))
const DashboardPage = lazy(() => import('@/pages/dashboard-page'))
const SavedEventsPage = lazy(() => import('@/pages/saved-events-page'))
const ItineraryPage = lazy(() => import('@/pages/itinerary-page'))
const CreateEventPage = lazy(() => import('@/pages/create-event-page'))
const CreateCommunityPage = lazy(() => import('@/pages/create-community-page'))
const EditEventPage = lazy(() => import('@/pages/edit-event-page'))
const ManagePage = lazy(() => import('@/pages/manage-page'))
const ProfileSettingsPage = lazy(() => import('@/pages/profile-settings-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<LandingPage />),
      },
      {
        path: 'discover',
        element: withSuspense(<DiscoverPage />),
      },
      {
        path: 'events/:slug',
        element: withSuspense(<EventDetailPage />),
      },
      {
        path: 'communities',
        element: withSuspense(<CommunitiesPage />),
      },
      {
        path: 'communities/:slug',
        element: withSuspense(<CommunityDetailPage />),
      },
      {
        path: 'login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'signup',
        element: withSuspense(<SignupPage />),
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          {
            path: 'dashboard',
            element: withSuspense(<DashboardPage />),
          },
          {
            path: 'saved',
            element: withSuspense(<SavedEventsPage />),
          },
          {
            path: 'itinerary',
            element: withSuspense(<ItineraryPage />),
          },
          {
            path: 'events/new',
            element: withSuspense(<CreateEventPage />),
          },
          {
            path: 'communities/new',
            element: withSuspense(<CreateCommunityPage />),
          },
          {
            path: 'events/:eventId/edit',
            element: withSuspense(<EditEventPage />),
          },
          {
            path: 'manage',
            element: withSuspense(<ManagePage />),
          },
          {
            path: 'settings',
            element: withSuspense(<ProfileSettingsPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])
