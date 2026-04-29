import Link from 'next/link'

const APPS = [
  {
    id: 'recruitment',
    title: 'Hiring Hub',
    description: '',
    color: 'indigo',
    portals: [
      {
        label: 'Hiring Manager',
        description: 'Post jobs, screen candidates, manage your pipeline',
        href: '/login?next=/jobs',
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h-8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
          </svg>
        ),
        primary: true,
      },
      {
        label: 'Job Seeker',
        description: 'Build your CV, write cover letters, ace your interview',
        href: '/login?next=/candidate/dashboard',
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        primary: false,
      },
    ],
  },
]

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 28, r: 7, text: 'text-base' },
    md: { box: 36, r: 9, text: 'text-xl' },
    lg: { box: 52, r: 13, text: 'text-3xl' },
  }
  const s = sizes[size]
  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.box} height={s.box} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="52" height="52" rx={s.r} fill="url(#logoGrad)" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="26" r="5" fill="white" fillOpacity="0.4" />
        <circle cx="26" cy="16" r="5" fill="white" fillOpacity="0.75" />
        <circle cx="36" cy="26" r="5" fill="white" />
        <circle cx="26" cy="36" r="5" fill="white" fillOpacity="0.6" />
        <line x1="16" y1="26" x2="26" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="26" y1="16" x2="36" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="36" y1="26" x2="26" y2="36" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="26" y1="36" x2="16" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      </svg>
      <span className={`${s.text} font-black tracking-tight`}>
        <span className="text-indigo-500">AI</span>
        <span className="text-slate-800"> Pips</span>
      </span>
    </div>
  )
}

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #ffffff 45%, #f5f3ff 100%)' }}>

      {/* Nav */}
      <header className="border-b border-slate-100/80 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 w-full">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-5 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI tools
            </span>
            <span className="text-slate-900"> that make</span>
            <br />
            <span className="text-slate-900">common sense</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium tracking-wide max-w-md mx-auto">
            Intelligent hiring and career tools built for people, not process.
          </p>
        </div>

        {/* Apps */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Applications</h2>

          {APPS.map(app => (
            <div
              key={app.id}
              className="rounded-3xl border border-indigo-100/60 p-8 mb-6"
              style={{ background: 'linear-gradient(145deg, rgba(238,237,255,0.6) 0%, rgba(255,255,255,0.9) 60%, rgba(245,243,255,0.4) 100%)', boxShadow: '0 2px 24px rgba(99,102,241,0.07), 0 1px 3px rgba(99,102,241,0.08)' }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{app.title}</h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 tracking-wide">
                    Beta
                  </span>
                </div>
                {app.description && <p className="text-slate-500 text-base">{app.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.portals.map(portal => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      portal.primary
                        ? 'border-transparent text-white'
                        : 'bg-white border-indigo-100 text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                    style={portal.primary ? { background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' } : undefined}
                  >
                    <span className={`shrink-0 ${portal.primary ? 'text-white/90' : 'text-indigo-400'}`}>
                      {portal.icon}
                    </span>
                    <div>
                      <p className={`font-bold text-base ${portal.primary ? 'text-white' : 'text-slate-800'}`}>
                        {portal.label}
                      </p>
                      <p className={`text-sm mt-0.5 ${portal.primary ? 'text-white/75' : 'text-slate-500'}`}>
                        {portal.description}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 ml-auto shrink-0 transition-transform group-hover:translate-x-1 ${portal.primary ? 'text-white/60' : 'text-slate-300'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <Logo size="sm" />
              <p className="text-sm text-slate-400 mt-2 max-w-xs">
                AI tools that make common sense.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-1 text-sm text-slate-400">
              <p className="text-xs mt-3">© {new Date().getFullYear()} AI Pips. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
