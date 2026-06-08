import React from 'react'

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: '#1c2e50', borderTopColor: '#6366f1' }}
      />
      <p className="text-sm" style={{ color: '#7090b8' }}>AI analiz yapıyor...</p>
    </div>
  )
}

function SizingResult({ result }) {
  const conf = (result.confidence || '').toLowerCase()
  const confidenceColor = conf === 'yüksek' || conf === 'high' ? '#22c55e'
    : conf === 'orta' || conf === 'medium' ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="flex flex-col gap-4">
      {/* Predicted Points */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold" style={{ color: '#818cf8' }}>
            {result.predictedPoints}
          </span>
          <span className="text-xs mt-1" style={{ color: '#7090b8' }}>Story Points</span>
        </div>
        <div className="flex flex-col gap-1">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
            style={{
              backgroundColor: `${confidenceColor}18`,
              color: confidenceColor,
              borderColor: `${confidenceColor}60`,
            }}
          >
            Güven: {result.confidence}
          </span>
          {result.complexity && (
            <span className="text-xs" style={{ color: '#4e6e98' }}>
              Karmaşıklık: <span style={{ color: '#7090b8' }}>{result.complexity}</span>
            </span>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {result.reasoning && (
        <div className="rounded-lg p-3" style={{ background: 'linear-gradient(135deg, #060e1a, #0a1628)', border: '1px solid #1c2e50' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>AI Gerekçesi</p>
          <p className="text-sm leading-relaxed" style={{ color: '#b8ccdd' }}>{result.reasoning}</p>
        </div>
      )}

      {/* Risks */}
      {result.risks && result.risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>Riskler</p>
          <ul className="flex flex-col gap-1.5">
            {result.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#7090b8' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }}>⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const subtaskTypeConfig = {
  Frontend: { bg: '#0f2048', text: '#93c5fd', border: '#2563eb' },
  Backend:  { bg: '#280b04', text: '#fdba74', border: '#c2410c' },
  DB:       { bg: '#1c0840', text: '#c4b5fd', border: '#7c3aed' },
  Database: { bg: '#1c0840', text: '#c4b5fd', border: '#7c3aed' },
  Test:     { bg: '#0a2e1a', text: '#86efac', border: '#16a34a' },
  DevOps:   { bg: '#0d1a30', text: '#7090b8', border: '#1c2e50' },
}

function SubtaskTypeBadge({ type }) {
  const cfg = subtaskTypeConfig[type] || subtaskTypeConfig.DevOps
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {type}
    </span>
  )
}

function DecomposeResult({ result }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#1c2e50' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #060e1a, #0a1628)' }}>
              {['Tip', 'Başlık', 'Atanan', 'Süre', 'Gerekçe'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-xs font-semibold"
                  style={{ color: '#4e6e98', borderBottom: '1px solid #1c2e50' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(result.subtasks || []).map((sub, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid #0d1a30' }}
                className="transition-colors"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f1e35'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td className="px-3 py-2">
                  <SubtaskTypeBadge type={sub.type} />
                </td>
                <td className="px-3 py-2" style={{ color: '#e8f0fa' }}>{sub.title}</td>
                <td className="px-3 py-2" style={{ color: '#7090b8' }}>{sub.assignedName || sub.assignee || '-'}</td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#7090b8' }}>
                  {sub.estimatedHours || sub.hours ? `${sub.estimatedHours || sub.hours}h` : '-'}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: '#4e6e98' }}>{sub.reason || sub.reasoning || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.totalEstimate && (
        <p className="text-sm font-medium" style={{ color: '#7090b8' }}>
          Toplam Tahmin:{' '}
          <span style={{ color: '#22c55e' }}>{result.totalEstimate}</span>
        </p>
      )}
    </div>
  )
}

function UnblockResult({ result }) {
  const priorityColor =
    result.priority === 'high' ? '#ef4444'
    : result.priority === 'medium' ? '#f59e0b'
    : '#22c55e'

  return (
    <div className="flex flex-col gap-4">
      {/* Root Cause */}
      {result.rootCause && (
        <div
          className="rounded-lg p-3 border"
          style={{ backgroundColor: '#380808', borderColor: '#7f1d1d' }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: '#fca5a5' }}>Kök Neden</p>
          <p className="text-sm leading-relaxed" style={{ color: '#fca5a5' }}>{result.rootCause}</p>
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {result.priority && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: `${priorityColor}18`,
              color: priorityColor,
              borderColor: `${priorityColor}60`,
            }}
          >
            {result.priority === 'high' ? 'Yüksek Öncelik' : result.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
          </span>
        )}
        {result.estimatedResolutionDays !== undefined && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ backgroundColor: '#0f2048', color: '#93c5fd', borderColor: '#2563eb' }}
          >
            ~{result.estimatedResolutionDays} gün
          </span>
        )}
      </div>

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#22c55e' }}>Öneriler</p>
          <ol className="flex flex-col gap-1.5 list-none">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#7090b8' }}>
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ backgroundColor: '#0a2e1a', color: '#22c55e' }}
                >
                  {i + 1}
                </span>
                <span>
                  <span style={{ color: '#22c55e', marginRight: '4px' }}>→</span>
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function HealthGauge({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#334155" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="20" fontWeight="700">
          {score}
        </text>
        <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="10">
          Health
        </text>
      </svg>
    </div>
  )
}

function ReviewResult({ result }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-6">
        <HealthGauge score={result.healthScore || 0} />
        <div className="flex-1">
          <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>Sprint Özeti</p>
          <p className="text-sm leading-relaxed" style={{ color: '#b8ccdd' }}>{result.summary}</p>
        </div>
      </div>

      {result.achievements && result.achievements.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#22c55e' }}>Başarılar</p>
          <ul className="flex flex-col gap-1.5">
            {result.achievements.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#7090b8' }}>
                <span className="flex-shrink-0" style={{ color: '#22c55e' }}>✓</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>Öneriler</p>
          <ul className="flex flex-col gap-1.5">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#7090b8' }}>
                <span className="flex-shrink-0" style={{ color: '#f59e0b' }}>→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function AiResultPanel({ loading, result, error, type }) {
  if (loading) return <Spinner />

  if (error) {
    return (
      <div
        className="rounded-lg p-4 border"
        style={{ backgroundColor: '#380808', borderColor: '#7f1d1d' }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: '#fca5a5' }}>Hata oluştu</p>
        <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
      </div>
    )
  }

  if (!result) return null

  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 100%)',
        borderColor: '#1c2e50',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: '#818cf8' }}>
        🤖 AI Sonucu
      </p>
      {type === 'sizing' && <SizingResult result={result} />}
      {type === 'decompose' && <DecomposeResult result={result} />}
      {type === 'review' && <ReviewResult result={result} />}
      {type === 'unblock' && <UnblockResult result={result} />}
    </div>
  )
}
