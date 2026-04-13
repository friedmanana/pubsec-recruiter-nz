'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { candidateApi } from '@/lib/candidateApi'
import type { JobApplication } from '@/types'

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  COMPLETE: { label: 'Complete', color: 'bg-green-100 text-green-700' },
}

export default function CandidateDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidateApi.listApplications()
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await candidateApi.deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your CV and cover letter for each job</p>
        </div>
        <button
          onClick={() => router.push('/candidate/applications/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Application
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No applications yet</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first application to start tailoring your CV</p>
          <button
            onClick={() => router.push('/candidate/applications/new')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Get started
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {applications.map((app) => {
            const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.DRAFT
            return (
              <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{app.job_title || 'Untitled Role'}</h3>
                    {app.company && <p className="text-sm text-slate-500">{app.company}</p>}
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {new Date(app.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/candidate/applications/${app.id}`}
                    className="flex-1 text-center py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Open workspace
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
