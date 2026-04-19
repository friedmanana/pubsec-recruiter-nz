'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { candidateApi } from '@/lib/candidateApi'

const PHASE_LABELS: Record<string, string> = {
  '1': 'CV Enhancement',
  '2': 'Cover Letter',
  '3': 'Interview Prep',
}

function NewApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phase = searchParams.get('phase') ?? '1'
  const toolLabel = PHASE_LABELS[phase] ?? 'Workspace'

  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jdText, setJdText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) return
    setSaving(true)
    setError(null)
    try {
      const app = await candidateApi.createApplication({
        job_title: jobTitle.trim(),
        company: company.trim(),
        job_description_text: jdText.trim(),
      })
      router.push(`/candidate/applications/${app.id}?phase=${phase}`)
    } catch (err) {
      setError(String(err))
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/candidate/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Start {toolLabel}</h1>
        <p className="text-sm text-slate-500 mt-1">Tell us about the role — the AI will tailor everything to it.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              placeholder="e.g. Senior Policy Advisor"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organisation / Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Ministry of Business, Innovation & Employment"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Description
              <span className="ml-1 text-xs font-normal text-slate-400">(optional — paste from the job ad)</span>
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here. The AI uses this to tailor your CV and cover letter specifically for this role."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words` : 'Adding a job description gives much better AI results'}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !jobTitle.trim()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Creating…' : 'Create & open workspace'}
            </button>
            <Link
              href="/candidate/dashboard"
              className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewApplicationPage() {
  return (
    <Suspense>
      <NewApplicationForm />
    </Suspense>
  )
}
