'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import type { Job, JobStatus } from '@/types'

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  OPEN:   { label: 'Open',   className: 'bg-green-100 text-green-800' },
  DRAFT:  { label: 'Draft',  className: 'bg-slate-100 text-slate-600' },
  CLOSED: { label: 'Closed', className: 'bg-red-100 text-red-800' },
  FILLED: { label: 'Filled', className: 'bg-blue-100 text-blue-800' },
}

const ALL_STATUSES: JobStatus[] = ['DRAFT', 'OPEN', 'CLOSED', 'FILLED']

function formatDate(dateStr: string) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return null }
}

function StatusBadge({ job, onStatusChange }: { job: Job; onStatusChange: (id: string, status: JobStatus) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const status = statusConfig[job.status] ?? { label: job.status, className: 'bg-slate-100 text-slate-600' }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = async (s: JobStatus) => {
    if (s === job.status) { setOpen(false); return }
    setSaving(true)
    setOpen(false)
    try {
      await api.updateJobStatus(job.id, s)
      onStatusChange(job.id, s)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={saving}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${status.className} hover:opacity-80 cursor-pointer disabled:opacity-50`}
      >
        {saving ? '…' : status.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[110px]">
          {ALL_STATUSES.map(s => {
            const cfg = statusConfig[s]
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center gap-2 ${s === job.status ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className={`inline-block px-1.5 py-0.5 rounded-full ${cfg.className}`}>{cfg.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function JobCard({ job, onDelete, onStatusChange }: { job: Job; onDelete: (id: string) => void; onStatusChange: (id: string, status: JobStatus) => void }) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const org = job.organisation !== 'Unknown Organisation' ? job.organisation : null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteJob(job.id)
      onDelete(job.id)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 hover:border-indigo-200 hover:shadow-sm transition-all group flex items-start gap-4">
        {/* Clickable main area */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/jobs/${job.id}`)}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
              {job.title}
            </h2>
            <StatusBadge job={job} onStatusChange={onStatusChange} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {org && <span>{org}</span>}
            {org && job.location && <span className="text-slate-300">·</span>}
            {job.location && <span>{job.location}</span>}
            {job.salary_band && <span className="text-slate-300">·</span>}
            {job.salary_band && <span>{job.salary_band}</span>}
          </div>
        </div>

        {/* Right side: dates + actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            {job.closing_date && (
              <p className="text-xs text-slate-400">Closes {formatDate(job.closing_date)}</p>
            )}
            <p className="text-xs text-slate-300 mt-0.5">Created {formatDate(job.created_at)}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Link
              href={`/jobs/${job.id}?edit=true`}
              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit job description"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete job"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 text-center mb-1">Delete this job?</h3>
            <p className="text-sm text-slate-500 text-center mb-1">{job.title}</p>
            <p className="text-xs text-slate-400 text-center mb-6">This will also delete all candidates and screening results. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting…
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function JobsDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login?next=/jobs')
      } else {
        setChecking(false)
        api.listJobs().then(data => {
          setJobs(data)
          setLoading(false)
        }).catch(() => setLoading(false))
      }
    })
  }, [router])

  if (checking) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">All your posted roles</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h-8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">No roles yet</h2>
          <p className="text-sm text-slate-400 mb-6">Post your first role to get started</p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={id => setJobs(prev => prev.filter(j => j.id !== id))}
              onStatusChange={(id, status) => setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
