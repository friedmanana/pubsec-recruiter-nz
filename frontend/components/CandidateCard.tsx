import type { ScreeningResult, Recommendation } from '@/types'
import ScoreBadge from './ScoreBadge'

interface CandidateCardProps {
  result: ScreeningResult
}

const recommendationConfig: Record<
  Recommendation,
  { label: string; className: string }
> = {
  SHORTLIST: { label: 'Shortlist', className: 'bg-green-100 text-green-800' },
  SECOND_ROUND: { label: 'Second Round', className: 'bg-blue-100 text-blue-800' },
  HOLD: { label: 'Hold', className: 'bg-yellow-100 text-yellow-800' },
  DECLINE: { label: 'Decline', className: 'bg-red-100 text-red-800' },
}

function SubScore({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75 ? 'text-green-700' : score >= 55 ? 'text-yellow-700' : score >= 35 ? 'text-orange-600' : 'text-red-600'
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-semibold ${color}`}>{Math.round(score)}</span>
      <span className="text-xs text-slate-400 whitespace-nowrap">{label}</span>
    </span>
  )
}

export default function CandidateCard({ result }: CandidateCardProps) {
  const rec = recommendationConfig[result.recommendation] ?? {
    label: result.recommendation,
    className: 'bg-slate-100 text-slate-800',
  }

  const displayStrengths = (result.strengths ?? []).slice(0, 3)
  const displayConcerns = (result.concerns ?? []).slice(0, 2)

  // Only show non-"Unknown" / non-empty subtitle parts
  const subtitleParts = [result.current_title, result.current_organisation].filter(
    (v) => v && v !== 'Unknown'
  )

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start gap-4">
        <ScoreBadge score={result.overall_score} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-base leading-tight">
                {result.full_name && result.full_name !== 'Unknown' ? result.full_name : 'Candidate'}
              </h3>
              {subtitleParts.length > 0 && (
                <p className="text-sm text-slate-600 mt-0.5">{subtitleParts.join(' · ')}</p>
              )}
              {result.location && result.location !== 'New Zealand' && (
                <p className="text-xs text-slate-500 mt-0.5">{result.location}</p>
              )}
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${rec.className}`}
            >
              {rec.label}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3">
        <SubScore label="Skills" score={result.skill_match_score ?? 0} />
        <SubScore label="Experience" score={result.experience_score ?? 0} />
        <SubScore label="NZ Fit" score={result.nz_fit_score ?? 0} />
      </div>

      {/* Reason */}
      {result.recommendation_reason && (
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {result.recommendation_reason}
        </p>
      )}

      {/* Strengths */}
      {displayStrengths.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Strengths</p>
          <div className="flex flex-wrap gap-1.5">
            {displayStrengths.map((strength, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {displayConcerns.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Concerns</p>
          <div className="flex flex-wrap gap-1.5">
            {displayConcerns.map((concern, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-50 text-red-700"
              >
                {concern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* LinkedIn */}
      {result.linkedin_url && (
        <div className="mt-3">
          <a
            href={result.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View LinkedIn profile →
          </a>
        </div>
      )}
    </div>
  )
}
