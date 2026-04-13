import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicCandidatePage = path === '/candidate/login' || path === '/candidate/signup'
  const isCandidatePage = path.startsWith('/candidate')

  // Only run Supabase auth check for candidate routes
  if (!isCandidatePage) {
    return NextResponse.next({ request })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars missing, allow through (will fail gracefully in page)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (isCandidatePage && !isPublicCandidatePage && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/candidate/login'
      return NextResponse.redirect(url)
    }

    if (isPublicCandidatePage && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/candidate/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // On any error, allow the request through — don't break the whole site
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
