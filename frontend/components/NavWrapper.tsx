'use client'

import { usePathname } from 'next/navigation'
import Nav from '@/components/Nav'

export default function NavWrapper() {
  const pathname = usePathname()
  const isCandidatePage = pathname.startsWith('/candidate')
  const isHomePage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/reset-password'
  if (isCandidatePage || isHomePage || isAuthPage) return null
  return <Nav />
}
