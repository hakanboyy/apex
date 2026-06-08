import React, { useState, useEffect } from 'react'
import TaskCard from '../components/TaskCard'
import AiResultPanel from '../components/AiResultPanel'
import { getBacklog, decomposeTask } from '../services/api'

const subtaskTypeConfig = {
  Frontend: { bg: '#0f2048', text: '#93c5fd', border: '#2563eb' },
  Backend:  { bg: '#280b04', text: '#fdba74', border: '#c2410c' },
  DB:       { bg: '#1c0840', text: '#c4b5fd', border: '#7c3aed' },
  Database: { bg: '#1c0840', text: '#c4b5fd', border: '#7c3aed' },
  Test:     { bg: '#0a2e1a', text: '#86efac', border: '#16a34a' },
  DevOps:   { bg: '#0d1a30', text: '#7090b8', border: '#1c2e50' },
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
        <h1 className="text-2xl font-bold" style={{ color: '#e8f0fa' }}>
          Task Kırılım &amp; Akıllı Atama
        </h1>
        <p className="text-sm mt-1" style={{ color: '#4e6e98' }}>
          Bir görev seçin, AI ile alt görevlere parçalayın ve ekibe otomatik atayın
        </p>
      </div>

      {fetchError && (
        <div className="rounded-xl p-4 border" style={{ backgroundColor: '#380808', borderColor: '#7f1d1d' }}>
          <p className="text-sm" style={{ color: '#fca5a5' }}>{fetchError}</p>
        </div>
      )}

      {/* Horizontal Task Scroll */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#1c2e50', borderTopColor: '#6366f1' }} />
        </div>
      ) : (
        <div className="rounded-xl border p-4" style={{ background: 'linear-gradient(135deg, #0d1a30, #101e35)', borderColor: '#1c2e50' }}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#4e6e98' }}>
            GÖREV SEÇ ({tasks.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} compact selected={selectedTask?.id === task.id} onClick={handleSelectTask} />
            ))}
            {tasks.length === 0 && (
              <p className="text-sm" style={{ color: '#3d5575' }}>Görev bulunamadı.</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedTask && (
        <div className="flex gap-5">
          {/* Left — Task Detail */}
          <div style={{ width: '33%' }}>
            <div
              className="rounded-xl border p-5 flex flex-col gap-4 sticky top-0"
              style={{ background: 'linear-gradient(160deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div>
                <p className="text-xs mb-1" style={{ color: '#3d5575' }}>#{selectedTask.id}</p>
                <p className="text-base font-semibold" style={{ color: '#e8f0fa' }}>{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <p className="text-sm leading-relaxed" style={{ color: '#7090b8' }}>{selectedTask.description}</p>
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
                    <p style={{ color: '#3d5575' }}>{k}</p>
                    <p className="font-medium" style={{ color: '#7090b8' }}>{v}</p>
                  </div>
                ))}
              </div>

              {selectedTask.acceptanceCriteria && selectedTask.acceptanceCriteria.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#4e6e98' }}>Kabul Kriterleri</p>
                  <ul className="flex flex-col gap-1">
                    {selectedTask.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#7090b8' }}>
                        <span style={{ color: '#22c55e' }}>✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleDecompose}
                disabled={loadingDecompose}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loadingDecompose ? '#4f46e5' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 18px rgba(99,102,241,0.35)',
                }}
              >
                {loadingDecompose ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    Parçalanıyor...
                  </span>
                ) : (
                  '⚡ AI ile Parçala'
                )}
              </button>
            </div>
          </div>

          {/* Right — Subtask Table */}
          <div style={{ width: '67%' }}>
            <div
              className="rounded-xl border p-5"
              style={{ background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: '#e8f0fa' }}>Alt Görev Kırılımı</p>
                {decomposition && !loadingDecompose && (
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                    style={{
                      backgroundColor: copied ? '#0a2e1a' : '#060e1a',
                      borderColor: copied ? '#16a34a' : '#1c2e50',
                      color: copied ? '#86efac' : '#7090b8',
                    }}
                  >
                    {copied ? '✓ Kopyalandı!' : '📋 Raporu Kopyala'}
                  </button>
                )}
              </div>

              {loadingDecompose || decomposeError || decomposition ? (
                <>
                  {(loadingDecompose || decomposeError) && (
                    <AiResultPanel type="decompose" loading={loadingDecompose} result={null} error={decomposeError} />
                  )}
                  {decomposition && !loadingDecompose && (
                    <div className="flex flex-col gap-4">
                      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#1c2e50' }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #060e1a, #0a1628)' }}>
                              {['Tip', 'Başlık', 'Atanan Kişi', 'Süre', 'Gerekçe'].map((h) => (
                                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold" style={{ color: '#4e6e98', borderBottom: '1px solid #1c2e50' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(decomposition.subtasks || []).map((sub, i) => (
                              <tr
                                key={i}
                                style={{ borderBottom: '1px solid #0d1a30' }}
                                className="transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f1e35'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <td className="px-3 py-2.5"><SubtaskBadge type={sub.type} /></td>
                                <td className="px-3 py-2.5 font-medium" style={{ color: '#e8f0fa' }}>{sub.title}</td>
                                <td className="px-3 py-2.5" style={{ color: '#7090b8' }}>{sub.assignedName || sub.assignee || '-'}</td>
                                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#7090b8' }}>
                                  {sub.estimatedHours || sub.hours ? `${sub.estimatedHours || sub.hours}h` : '-'}
                                </td>
                                <td className="px-3 py-2.5 text-xs" style={{ color: '#4e6e98', maxWidth: '200px' }}>
                                  {sub.reason || sub.reasoning || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: '#7090b8' }}>
                          Toplam Süre:{' '}
                          <span className="font-bold" style={{ color: '#22c55e' }}>
                            {decomposition.totalEstimate || '-'}
                          </span>
                        </p>
                        <button
                          onClick={handleCopyReport}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150"
                          style={{
                            backgroundColor: copied ? '#0a2e1a' : '#0d1a30',
                            borderColor: copied ? '#16a34a' : '#1c2e50',
                            color: copied ? '#86efac' : '#7090b8',
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
                  <p className="text-sm" style={{ color: '#3d5575' }}>
                    "AI ile Parçala" butonuna tıklayarak kırılımı başlatın
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedTask && !loading && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #0d1a30, #101e35)', borderColor: '#1c2e50' }}
        >
          <p className="text-4xl mb-4">⚡</p>
          <p className="text-base font-medium mb-2" style={{ color: '#e8f0fa' }}>
            Başlamak için bir görev seçin
          </p>
          <p className="text-sm" style={{ color: '#4e6e98' }}>
            Yukarıdaki listeden bir görev seçin, ardından AI ile alt görevlere parçalayın
          </p>
        </div>
      )}
    </div>
  )
}
