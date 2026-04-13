'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const isPublic = pathname === '/candidate/login' || pathname === '/candidate/signup'

  useEffect(() => {
    if (isPublic) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/candidate/login'); return }
      setUserEmail(data.user.email ?? null)
    })
  }, [isPublic, router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/candidate/login')
  }

  if (isPublic) return <>{children}</>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Candidate nav */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/candidate/dashboard" className="text-sm font-bold text-indigo-600">
              Career Assistant
            </Link>
            <Link href="/candidate/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              My Applications
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && <span className="text-xs text-slate-400">{userEmail}</span>}
            <button
              onClick={handleSignOut}
              className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
