'use client'

import { useState, useEffect } from 'react'
import { isAuthenticated, logout, getCurrentUser } from '../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, CreditCard, X, BookOpen, Brain } from 'lucide-react'

export default function Header() {
  const [user, setUser] = useState<{name?: string; email?: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      if (isAuthenticated()) {
        try {
          const response = await getCurrentUser()
          if (response.data) {
            setUser(response.data.user)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    loadUser()

    // Listen for storage changes (when token is added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        loadUser()
      }
    }

    // Listen for custom events (for programmatic token changes)
    const handleAuthChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      setSidebarOpen(false)
      await logout()
      // Clear any additional state here if needed
      setUser(null)
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to signin
      router.push('/auth/signin')
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  const scrollToAIReport = () => {
    // Check if we're already on the homepage
    if (window.location.pathname === '/') {
      // We're on homepage, scroll to the AI report section
      const aiReportElement = document.getElementById('ai-financial-report')
      if (aiReportElement) {
        aiReportElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
      }
    } else {
      // We're on a different page, navigate to homepage with hash
      router.push('/#ai-financial-report')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-4 backdrop-blur-md fixed top-0 right-0 left-0 border-b border-neutral-900 z-10">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ) : user ? (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center justify-center size-8 rounded-full bg-white text-black font-medium text-sm ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={scrollToAIReport}
                className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                title="AI Financial Report"
              >
                <Brain className="w-5 h-5" />
              </button>
              <a
                href="https://elevenlabs.io/app/talk-to?agent_id=agent_2601k638558re60tj4jf0w8yrjj9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white cursor-pointer transition-colors"
                title="AI Voice Coach"
              >
                <BookOpen className="w-5 h-5" />
              </a>
              <Menu 
                onClick={() => setSidebarOpen(true)}
                className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors" 
                title="Menu"
              />
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

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-gray-800 transform transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Menu</h2>
              <button
                onClick={closeSidebar}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black font-medium text-lg ring-2 ring-gray-700">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-4">
              <Link
                href="/cards"
                onClick={closeSidebar}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span>Manage Cards</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}