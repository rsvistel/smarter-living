'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Bell, Menu, LogOut } from 'lucide-react'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <div className="flex items-center justify-between gap-3 p-4 backdrop-blur-md fixed top-0 right-0 left-0 border-b border-neutral-900 z-10">
      {status === 'loading' ? (
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      ) : session ? (
        <div className="w-full flex items-center justify-between gap-3">
          <div>
            <img
              alt={session.user?.name || session.user?.email || 'User'}
              src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="inline-block size-8 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
            />
          </div>
          <div className="flex gap-3">
            <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors" />
            <div className="relative group">
              <Menu className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <div className="absolute right-0 top-8 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300 truncate">{session.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-end gap-3">
          <Link
            href="/auth/signin"
            className="px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="px-3 py-1.5 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-md transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  )
}