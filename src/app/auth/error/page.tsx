'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid. It may have been used already or it may have expired.',
  Default: 'Something went wrong. Please try again.',
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-light text-white">
            Authentication Error
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            {errorMessages[error] || errorMessages.Default}
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  )
}