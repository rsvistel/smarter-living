'use client'

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import { setAuthToken, removeAuthToken } from '../lib/api'

interface SessionProviderProps {
  children: ReactNode
  session?: unknown
}

function TokenSyncer() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user && (session as any).backendToken) {
      // Store backend token when session exists
      setAuthToken((session as any).backendToken)
    } else {
      // Remove token when session doesn't exist
      removeAuthToken()
    }
  }, [session])

  return null
}

export default function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      <TokenSyncer />
      {children}
    </NextAuthSessionProvider>
  )
}