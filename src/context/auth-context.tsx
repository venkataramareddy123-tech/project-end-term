/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { appModeLabel } from '@/lib/env'
import {
  getSession,
  signIn,
  signOut,
  signUp,
  subscribeToAuthChanges,
  updateProfile,
} from '@/services/auth'
import type { SignInInput, SignUpInput, UserProfile } from '@/types'

interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  isAuthBusy: boolean
  appMode: string
  login: (input: SignInInput) => Promise<UserProfile | null>
  signup: (input: SignUpInput) => Promise<UserProfile | null>
  logout: () => Promise<void>
  saveProfile: (input: Partial<UserProfile>) => Promise<UserProfile>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthBusy, setIsAuthBusy] = useState(false)

  const refreshSession = useCallback(async () => {
    const session = await getSession()
    setUser(session.user)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refreshSession()
    return subscribeToAuthChanges(refreshSession)
  }, [refreshSession])

  const login = useCallback(async (input: SignInInput) => {
    setIsAuthBusy(true)
    try {
      const session = await signIn(input)
      setUser(session.user)
      return session.user
    } finally {
      setIsAuthBusy(false)
    }
  }, [])

  const signup = useCallback(async (input: SignUpInput) => {
    setIsAuthBusy(true)
    try {
      const session = await signUp(input)
      setUser(session.user)
      return session.user
    } finally {
      setIsAuthBusy(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsAuthBusy(true)
    try {
      await signOut()
      setUser(null)
    } finally {
      setIsAuthBusy(false)
    }
  }, [])

  const saveProfile = useCallback(
    async (input: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('You must be signed in to update your profile.')
      }

      setIsAuthBusy(true)
      try {
        const nextUser = await updateProfile(user.id, input)
        setUser(nextUser)
        return nextUser
      } finally {
        setIsAuthBusy(false)
      }
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthBusy,
      appMode: appModeLabel,
      login,
      signup,
      logout,
      saveProfile,
    }),
    [user, isLoading, isAuthBusy, login, signup, logout, saveProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
