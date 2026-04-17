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
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/candidate/dashboard" className="text-lg font-bold text-indigo-600">
              Career Assistant
            </Link>
            <Link href="/candidate/dashboard" className="text-base text-slate-600 hover:text-slate-900 font-medium">
              My Applications
            </Link>
          </div>
          <div className="flex items-center gap-5">
            {userEmail && <span className="text-sm text-slate-400">{userEmail}</span>}
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
