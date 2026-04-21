'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { candidateApi } from '@/lib/candidateApi'
import type { JobApplication } from '@/types'

const STATUS_CONFIG = {
  DRAFT:       { label: 'Draft',       color: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'  },
  COMPLETE:    { label: 'Complete',    color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

// "Sparky" — CV pip character, excited with sparkles
const CvPip = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
    {/* Sparkles */}
    <path d="M33 8l.6 1.8 1.8.6-1.8.6L33 12.8l-.6-1.8-1.8-.6 1.8-.6z" fill="currentColor" opacity="0.55"/>
    <circle cx="6" cy="13" r="1.1" fill="currentColor" opacity="0.4"/>
    <circle cx="35" cy="24" r="0.8" fill="currentColor" opacity="0.35"/>
    {/* Antenna */}
    <line x1="20" y1="5" x2="20" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="20" cy="3.5" r="2.2" fill="currentColor"/>
    {/* Head */}
    <rect x="8" y="9" width="24" height="19" rx="7" fill="currentColor"/>
    {/* Eyes — wide excited squares */}
    <rect x="12" y="13.5" width="6" height="6" rx="2" fill="white"/>
    <rect x="22" y="13.5" width="6" height="6" rx="2" fill="white"/>
    <circle cx="15" cy="16.5" r="2.1" fill="currentColor"/>
    <circle cx="25" cy="16.5" r="2.1" fill="currentColor"/>
    {/* Gleam dots */}
    <circle cx="15.9" cy="15.4" r="0.7" fill="white"/>
    <circle cx="25.9" cy="15.4" r="0.7" fill="white"/>
    {/* Big grin */}
    <path d="M14 24 Q20 29 26 24" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    {/* Body with CV lines */}
    <rect x="12" y="28" width="16" height="9" rx="4" fill="currentColor" opacity="0.72"/>
    <line x1="15" y1="31" x2="25" y2="31" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>
    <line x1="15" y1="34" x2="22" y2="34" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>
  </svg>
)

// "Penny" — Cover letter pip, playful wink, envelope body
const LetterPip = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
    {/* Heart accent */}
    <path d="M33 9 Q34.2 7.2 36 9 Q37.8 10.8 36 13 Q34.5 14.5 33 13 Q31.2 10.8 33 9z" fill="currentColor" opacity="0.5"/>
    {/* Antenna — little curl */}
    <path d="M20 9 C22 6 24 5 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="21.5" cy="2.5" r="2" fill="currentColor"/>
    {/* Head */}
    <rect x="8" y="9" width="24" height="19" rx="7" fill="currentColor"/>
    {/* Eyes — one normal, one wink */}
    <rect x="12" y="13.5" width="6" height="6" rx="2" fill="white"/>
    <circle cx="15" cy="16.5" r="2" fill="currentColor"/>
    <circle cx="15.8" cy="15.6" r="0.6" fill="white"/>
    {/* Wink eye */}
    <path d="M22 17 Q25 13.5 28 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Smile */}
    <path d="M14 24 Q20 28 26 24" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    {/* Body as envelope */}
    <rect x="10" y="28" width="20" height="10" rx="3.5" fill="currentColor" opacity="0.72"/>
    {/* Envelope flap */}
    <path d="M10 28 L20 35 L30 28" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
  </svg>
)

// "Echo" — Interview pip, confident, microphone chest
const InterviewPip = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
    {/* Stars */}
    <path d="M33 7l.5 1.6 1.6.5-1.6.5-.5 1.6-.5-1.6-1.6-.5 1.6-.5z" fill="currentColor" opacity="0.6"/>
    <path d="M6 17l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z" fill="currentColor" opacity="0.35"/>
    {/* Antenna + star tip */}
    <line x1="20" y1="5" x2="20" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 1.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z" fill="currentColor"/>
    {/* Head */}
    <rect x="8" y="9" width="24" height="19" rx="7" fill="currentColor"/>
    {/* Eyes — cool confident narrow */}
    <rect x="12" y="14" width="6" height="4.5" rx="2" fill="white"/>
    <rect x="22" y="14" width="6" height="4.5" rx="2" fill="white"/>
    <rect x="13.2" y="15" width="3.6" height="2.5" rx="1.2" fill="currentColor"/>
    <rect x="23.2" y="15" width="3.6" height="2.5" rx="1.2" fill="currentColor"/>
    {/* Gleam */}
    <circle cx="14.2" cy="15.4" r="0.6" fill="white"/>
    <circle cx="24.2" cy="15.4" r="0.6" fill="white"/>
    {/* Confident straight mouth */}
    <path d="M15 23.5 Q20 26.5 25 23.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    {/* Body */}
    <rect x="12" y="28" width="16" height="9" rx="4" fill="currentColor" opacity="0.72"/>
    {/* Mic on chest */}
    <rect x="18" y="29.5" width="4" height="5" rx="2" stroke="white" strokeWidth="1.3" fill="none" opacity="0.85"/>
    <path d="M17 35.5 Q20 37.5 23 35.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75"/>
    <line x1="20" y1="34.5" x2="20" y2="35.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.75"/>
  </svg>
)

const TOOLS = [
  {
    phase: 1,
    Icon: CvPip,
    label: 'CV Enhancement',
    description: 'AI tailors your CV to the role in seconds.',
    bg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    border: 'border-violet-200',
    text: 'text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    phase: 2,
    Icon: LetterPip,
    label: 'Cover Letter',
    description: 'Write or polish a cover letter that fits the role.',
    bg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    phase: 3,
    Icon: InterviewPip,
    label: 'Interview Prep',
    description: 'Practice questions and answers tailored to your interview.',
    bg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    border: 'border-sky-200',
    text: 'text-sky-700',
    btn: 'bg-sky-600 hover:bg-sky-700',
  },
]

export default function CandidateDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<number | null>(null)

  useEffect(() => {
    candidateApi.listApplications()
      .then(async (apps) => {
        // Auto-delete any applications with no job title and no content
        // (these are abandoned workspaces the user opened but never filled in)
        const empty = apps.filter((a) => !a.job_title?.trim())
        await Promise.all(empty.map((a) => candidateApi.deleteApplication(a.id).catch(() => {})))
        setApplications(apps.filter((a) => a.job_title?.trim()))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStart = async (phase: number) => {
    setStarting(phase)
    try {
      const app = await candidateApi.createApplication({ job_title: '', company: '', job_description_text: '' })
      router.push(`/candidate/applications/${app.id}?phase=${phase}`)
    } catch (err) {
      console.error(err)
      setStarting(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await candidateApi.deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      {/* Tool cards */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Job Seeker Tools</h1>
        <p className="text-sm text-slate-500 mb-6">Use each tool independently — or use all three for your next application.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.phase}
              className={`relative bg-white rounded-2xl border ${tool.border} p-6 flex flex-col hover:shadow-md transition-all`}
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.iconColor} flex items-center justify-center mb-4`}>
                <tool.Icon />
              </div>
              <h2 className={`text-base font-bold ${tool.text} mb-1`}>{tool.label}</h2>
              <p className="text-sm text-slate-500 flex-1 mb-5 leading-relaxed">{tool.description}</p>
              <button
                onClick={() => handleStart(tool.phase)}
                disabled={starting !== null}
                className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${tool.btn}`}
              >
                {starting === tool.phase
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Opening…</>
                  : 'Start →'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">My Applications</h2>
          <button
            onClick={() => handleStart(1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Application
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-7 h-7 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
            <p className="text-sm">No applications yet — start a tool above to get going.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => {
              const status = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
              const dateStr = new Date(app.created_at).toLocaleDateString('en-NZ', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <div
                  key={app.id}
                  className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 mb-4">
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-0.5">
                      {app.job_title || 'Untitled Role'}
                    </h3>
                    {app.company && <p className="text-sm text-slate-500">{app.company}</p>}
                    <p className="text-xs text-slate-400 mt-1.5">{dateStr}</p>
                  </div>
                  <Link
                    href={`/candidate/applications/${app.id}`}
                    className="block text-center py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                  >
                    Open →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
