import React, { useState, useEffect } from 'react'
import TaskCard from '../components/TaskCard'
import AiResultPanel from '../components/AiResultPanel'
import { getBacklog, decomposeTask } from '../services/api'

const subtaskTypeConfig = {
  Frontend: { bg: '#1e3a5f', text: '#93c5fd', border: '#3b82f6' },
  Backend: { bg: '#431407', text: '#fdba74', border: '#f97316' },
  DB: { bg: '#2e1065', text: '#c4b5fd', border: '#8b5cf6' },
  Database: { bg: '#2e1065', text: '#c4b5fd', border: '#8b5cf6' },
  Test: { bg: '#14532d', text: '#86efac', border: '#22c55e' },
  DevOps: { bg: '#1e293b', text: '#94a3b8', border: '#475569' },
}

function SubtaskBadge({ type }) {
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

function buildMarkdownReport(task, decomposition) {
  const subtasks = decomposition?.subtasks || []
  const rows = subtasks
    .map((s) => `| ${s.type} | ${s.title} | ${s.assignedName || '-'} | ${s.estimatedHours ? s.estimatedHours + 'h' : '-'} |`)
    .join('\n')

  return `# Task Kırılım Raporu: ${task.title}

## Alt Görevler
| Tip | Başlık | Atanan | Süre |
|-----|--------|--------|------|
${rows}

Toplam Tahmin: ${decomposition?.totalEstimate || '-'}
`
}

export default function Decompose() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [decomposition, setDecomposition] = useState(null)
  const [loadingDecompose, setLoadingDecompose] = useState(false)
  const [decomposeError, setDecomposeError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const res = await getBacklog()
        const all = res.data?.tasks || res.data || []
        setTasks(all)
      } catch (err) {
        setFetchError(err.message || 'Görevler yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const handleSelectTask = (task) => {
    setSelectedTask(task)
    setDecomposition(null)
    setDecomposeError(null)
  }

  const handleDecompose = async () => {
    if (!selectedTask) return
    setLoadingDecompose(true)
    setDecomposeError(null)
    setDecomposition(null)
    try {
      const res = await decomposeTask(selectedTask.id)
      setDecomposition(res.data?.result || res.data)
    } catch (err) {
      setDecomposeError(err.message || 'Kırılım yapılamadı')
    } finally {
      setLoadingDecompose(false)
    }
  }

  const handleCopyReport = async () => {
    if (!selectedTask || !decomposition) return
    const md = buildMarkdownReport(selectedTask, decomposition)
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Kopyalama başarısız. Tarayıcı izinlerini kontrol edin.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>
          Task Kırılım &amp; Akıllı Atama
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Bir görev seçin, AI ile alt görevlere parçalayın ve ekibe otomatik atayın
        </p>
      </div>

      {fetchError && (
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: '#450a0a', borderColor: '#ef4444' }}
        >
          <p className="text-sm" style={{ color: '#fca5a5' }}>{fetchError}</p>
        </div>
      )}

      {/* Horizontal Task Scroll */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#334155', borderTopColor: '#6366f1' }}
          />
        </div>
      ) : (
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>
            GÖREV SEÇ ({tasks.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                compact
                selected={selectedTask?.id === task.id}
                onClick={handleSelectTask}
              />
            ))}
            {tasks.length === 0 && (
              <p className="text-sm" style={{ color: '#475569' }}>Görev bulunamadı.</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content — 2 column */}
      {selectedTask && (
        <div className="flex gap-5">
          {/* Left — Task Detail (1/3) */}
          <div style={{ width: '33%' }}>
            <div
              className="rounded-xl border p-5 flex flex-col gap-4 sticky top-0"
              style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
            >
              <div>
                <p className="text-xs mb-1" style={{ color: '#475569' }}>#{selectedTask.id}</p>
                <p className="text-base font-semibold" style={{ color: '#f1f5f9' }}>
                  {selectedTask.title}
                </p>
              </div>

              {selectedTask.description && (
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                  {selectedTask.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Öncelik', selectedTask.priority],
                  ['Tip', selectedTask.type],
                  ['Durum', selectedTask.status],
                  ['Boyut', selectedTask.size ? `${selectedTask.size} SP` : '-'],
                  ['Atanan', selectedTask.assignee || '-'],
                  ['Etiketler', (selectedTask.tags || []).join(', ') || '-'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: '#475569' }}>{k}</p>
                    <p className="font-medium" style={{ color: '#94a3b8' }}>{v}</p>
                  </div>
                ))}
              </div>

              {selectedTask.acceptanceCriteria && selectedTask.acceptanceCriteria.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#64748b' }}>
                    Kabul Kriterleri
                  </p>
                  <ul className="flex flex-col gap-1">
                    {selectedTask.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#94a3b8' }}>
                        <span style={{ color: '#22c55e' }}>✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decompose Button */}
              <button
                onClick={handleDecompose}
                disabled={loadingDecompose}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loadingDecompose
                    ? '#4f46e5'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}
              >
                {loadingDecompose ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                    />
                    Parçalanıyor...
                  </span>
                ) : (
                  '⚡ AI ile Parçala'
                )}
              </button>
            </div>
          </div>

          {/* Right — Subtask Table (2/3) */}
          <div style={{ width: '67%' }}>
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>
                  Alt Görev Kırılımı
                </p>
                {decomposition && !loadingDecompose && (
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                    style={{
                      backgroundColor: copied ? '#14532d' : '#0f172a',
                      borderColor: copied ? '#22c55e' : '#334155',
                      color: copied ? '#86efac' : '#94a3b8',
                    }}
                  >
                    {copied ? '✓ Kopyalandı!' : '📋 Raporu Kopyala'}
                  </button>
                )}
              </div>

              {loadingDecompose || decomposeError || decomposition ? (
                <>
                  {(loadingDecompose || decomposeError) && (
                    <AiResultPanel
                      type="decompose"
                      loading={loadingDecompose}
                      result={null}
                      error={decomposeError}
                    />
                  )}
                  {decomposition && !loadingDecompose && (
                    <div className="flex flex-col gap-4">
                      <div
                        className="overflow-x-auto rounded-lg border"
                        style={{ borderColor: '#334155' }}
                      >
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: '#0f172a' }}>
                              {['Tip', 'Başlık', 'Atanan Kişi', 'Süre', 'Gerekçe'].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-2.5 text-left text-xs font-semibold"
                                  style={{ color: '#64748b', borderBottom: '1px solid #334155' }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(decomposition.subtasks || []).map((sub, i) => (
                              <tr
                                key={i}
                                style={{ borderBottom: '1px solid #1e293b' }}
                                className="transition-colors hover:bg-slate-800"
                              >
                                <td className="px-3 py-2.5">
                                  <SubtaskBadge type={sub.type} />
                                </td>
                                <td
                                  className="px-3 py-2.5 font-medium"
                                  style={{ color: '#f1f5f9' }}
                                >
                                  {sub.title}
                                </td>
                                <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>
                                  {sub.assignedName || sub.assignee || '-'}
                                </td>
                                <td
                                  className="px-3 py-2.5 whitespace-nowrap"
                                  style={{ color: '#94a3b8' }}
                                >
                                  {sub.estimatedHours || sub.hours ? `${sub.estimatedHours || sub.hours}h` : '-'}
                                </td>
                                <td
                                  className="px-3 py-2.5 text-xs"
                                  style={{ color: '#64748b', maxWidth: '200px' }}
                                >
                                  {sub.reason || sub.reasoning || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                          Toplam Süre:{' '}
                          <span className="font-bold" style={{ color: '#22c55e' }}>
                            {decomposition.totalEstimate || '-'}
                          </span>
                        </p>
                        <button
                          onClick={handleCopyReport}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150"
                          style={{
                            backgroundColor: copied ? '#14532d' : '#1e293b',
                            borderColor: copied ? '#22c55e' : '#334155',
                            color: copied ? '#86efac' : '#94a3b8',
                          }}
                        >
                          {copied ? '✓ Kopyalandı!' : '📋 Raporu Kopyala'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="text-4xl">⚡</span>
                  <p className="text-sm" style={{ color: '#475569' }}>
                    "AI ile Parçala" butonuna tıklayarak kırılımı başlatın
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no task selected */}
      {!selectedTask && !loading && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
        >
          <p className="text-4xl mb-4">⚡</p>
          <p className="text-base font-medium mb-2" style={{ color: '#f1f5f9' }}>
            Başlamak için bir görev seçin
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Yukarıdaki listeden bir görev seçin, ardından AI ile alt görevlere parçalayın
          </p>
        </div>
      )}
    </div>
  )
}
