'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { candidateApi } from '@/lib/candidateApi'
import type { JobApplication, CvDocument, CoverLetter } from '@/types'

type Tab = 'cv' | 'cover-letter' | 'job'

export default function ApplicationWorkspace() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [app, setApp] = useState<JobApplication | null>(null)
  const [originalCv, setOriginalCv] = useState<CvDocument | null>(null)
  const [enhancedCv, setEnhancedCv] = useState<CvDocument | null>(null)
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('cv')

  // CV states
  const [cvInput, setCvInput] = useState('')
  const [savingCv, setSavingCv] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [generatingCl, setGeneratingCl] = useState(false)

  // Job details editing
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jdText, setJdText] = useState('')
  const [savingJob, setSavingJob] = useState(false)

  const [copied, setCopied] = useState<'cv' | 'cl' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadApp = useCallback(async () => {
    try {
      const data = await candidateApi.getApplication(id)
      setApp(data)
      setOriginalCv(data.original_cv)
      setEnhancedCv(data.enhanced_cv)
      setCoverLetter(data.cover_letter)
      setJobTitle(data.job_title)
      setCompany(data.company)
      setJdText(data.job_description_text)
      if (data.original_cv) setCvInput(data.original_cv.content_text)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { loadApp() }, [loadApp])

  const handleSaveCv = async () => {
    if (!cvInput.trim()) return
    setSavingCv(true)
    setError(null)
    try {
      const saved = await candidateApi.uploadCv(id, cvInput)
      setOriginalCv(saved)
    } catch (e) { setError(String(e)) }
    finally { setSavingCv(false) }
  }

  const handleEnhanceCv = async () => {
    setEnhancing(true)
    setError(null)
    try {
      const enhanced = await candidateApi.enhanceCv(id)
      setEnhancedCv(enhanced)
    } catch (e) { setError(String(e)) }
    finally { setEnhancing(false) }
  }

  const handleGenerateCl = async () => {
    setGeneratingCl(true)
    setError(null)
    try {
      const cl = await candidateApi.generateCoverLetter(id)
      setCoverLetter(cl)
    } catch (e) { setError(String(e)) }
    finally { setGeneratingCl(false) }
  }

  const handleSaveJob = async () => {
    setSavingJob(true)
    try {
      await candidateApi.updateApplication(id, { job_title: jobTitle, company, job_description_text: jdText })
    } catch (e) { setError(String(e)) }
    finally { setSavingJob(false) }
  }

  const handleCopy = async (text: string, key: 'cv' | 'cl') => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  if (!app) return <div className="text-center py-12 text-slate-500">Application not found.</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/candidate/dashboard" className="text-sm text-slate-500 hover:text-slate-700">← My Applications</Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{app.job_title || 'Untitled Role'}</h1>
            {app.company && <p className="text-sm text-slate-500">{app.company}</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {([['cv', 'CV & Enhancement'], ['cover-letter', 'Cover Letter'], ['job', 'Job Details']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CV Tab */}
      {tab === 'cv' && (
        <div className="space-y-6">
          {/* Original CV input */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Your CV</h2>
                <p className="text-xs text-slate-500 mt-0.5">Paste your current CV text below</p>
              </div>
              {cvInput.trim() && (
                <span className="text-xs text-slate-400">{cvInput.split(/\s+/).filter(Boolean).length} words</span>
              )}
            </div>
            <textarea
              value={cvInput}
              onChange={(e) => setCvInput(e.target.value)}
              rows={12}
              placeholder="Paste your CV here... Include your work experience, education, skills, and achievements."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSaveCv}
                disabled={savingCv || !cvInput.trim()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {savingCv ? 'Saving…' : originalCv ? 'Update CV' : 'Save CV'}
              </button>
              {originalCv && (
                <button
                  onClick={handleEnhanceCv}
                  disabled={enhancing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {enhancing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Enhancing… (~20s)
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {enhancedCv ? 'Re-enhance with AI' : 'Enhance with AI'}
                    </>
                  )}
                </button>
              )}
            </div>
            {!originalCv && (
              <p className="text-xs text-amber-600 mt-2">Save your CV first, then use AI to enhance it{app.job_description_text ? ' for this specific role' : ''}.</p>
            )}
          </div>

          {/* Enhanced CV output */}
          {enhancedCv && (
            <div className="bg-white border border-indigo-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-indigo-900">✨ Enhanced CV</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI-tailored for {app.job_title}{app.company ? ` at ${app.company}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(enhancedCv.content_text, 'cv')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  {copied === 'cv' ? '✓ Copied!' : 'Copy text'}
                </button>
              </div>
              <div
                className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30 max-h-96 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: enhancedCv.content_html }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Tab */}
      {tab === 'cover-letter' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Cover Letter</h2>
                <p className="text-xs text-slate-500 mt-0.5">AI generates a tailored cover letter based on your CV and the job description</p>
              </div>
            </div>

            {!originalCv ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                Go to the <button onClick={() => setTab('cv')} className="underline font-medium">CV tab</button> and save your CV first.
              </div>
            ) : (
              <button
                onClick={handleGenerateCl}
                disabled={generatingCl}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {generatingCl ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Generating… (~20s)
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"/>
                    </svg>
                    {coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                  </>
                )}
              </button>
            )}
          </div>

          {coverLetter && (
            <div className="bg-white border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-green-900">✨ Cover Letter</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tailored for {app.job_title}{app.company ? ` at ${app.company}` : ''}</p>
                </div>
                <button
                  onClick={() => handleCopy(coverLetter.content_text, 'cl')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  {copied === 'cl' ? '✓ Copied!' : 'Copy text'}
                </button>
              </div>
              <div
                className="border border-green-100 rounded-lg p-4 bg-green-50/30 max-h-96 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: coverLetter.content_html }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Job Details Tab */}
      {tab === 'job' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Job Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Description
                <span className="ml-1 text-xs font-normal text-slate-400">— the AI uses this to tailor your CV</span>
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              onClick={handleSaveJob}
              disabled={savingJob}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {savingJob ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
