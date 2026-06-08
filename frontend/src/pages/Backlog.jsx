import React, { useState, useEffect } from 'react'
import TaskCard from '../components/TaskCard'
import AiResultPanel from '../components/AiResultPanel'
import { getBacklog, predictSizing, suggestUnblock } from '../services/api'

const PRIORITY_OPTIONS = ['Tümü', 'High', 'Medium', 'Low']
const TYPE_OPTIONS = ['Tümü', 'Story', 'Bug', 'Task']
const STATUS_OPTIONS = ['Tümü', 'Backlog', 'In Progress', 'Done', 'Blocked']

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: '#64748b' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-indigo-500 transition-colors"
        style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function Backlog() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loadingPredict, setLoadingPredict] = useState(false)
  const [predictError, setPredictError] = useState(null)
  const [filter, setFilter] = useState({ priority: 'Tümü', type: 'Tümü', status: 'Tümü' })
  const [unblockResult, setUnblockResult] = useState(null)
  const [loadingUnblock, setLoadingUnblock] = useState(false)
  const [unblockError, setUnblockError] = useState(null)
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const res = await getBacklog()
        setTasks(res.data?.tasks || res.data || [])
      } catch (err) {
        setFetchError(err.message || 'Backlog yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((t) => {
    if (filter.priority !== 'Tümü' && t.priority !== filter.priority) return false
    if (filter.type !== 'Tümü' && t.type !== filter.type) return false
    if (filter.status !== 'Tümü' && t.status !== filter.status) return false
    return true
  })

  const handleSelectTask = (task) => {
    setSelectedTask(task)
    setPrediction(null)
    setPredictError(null)
    setUnblockResult(null)
    setUnblockError(null)
    setBlockReason('')
  }

  const handleUnblock = async () => {
    if (!selectedTask) return
    setLoadingUnblock(true)
    setUnblockError(null)
    setUnblockResult(null)
    try {
      const res = await suggestUnblock(selectedTask.id, blockReason)
      setUnblockResult(res.data?.result || res.data)
    } catch (err) {
      setUnblockError(err.message || 'Blokaj çözümü üretilemedi')
    } finally {
      setLoadingUnblock(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedTask) return
    setLoadingPredict(true)
    setPredictError(null)
    setPrediction(null)
    try {
      const res = await predictSizing(selectedTask.id)
      setPrediction(res.data?.result || res.data)
    } catch (err) {
      setPredictError(err.message || 'Tahmin yapılamadı')
    } finally {
      setLoadingPredict(false)
    }
  }

  const handleAddToSprint = () => {
    alert(`"${selectedTask?.title}" görevi sprinte eklendi! (Demo)`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Backlog</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            {filteredTasks.length} görev listeleniyor
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Öncelik"
            value={filter.priority}
            options={PRIORITY_OPTIONS}
            onChange={(v) => setFilter((f) => ({ ...f, priority: v }))}
          />
          <FilterSelect
            label="Tip"
            value={filter.type}
            options={TYPE_OPTIONS}
            onChange={(v) => setFilter((f) => ({ ...f, type: v }))}
          />
          <FilterSelect
            label="Durum"
            value={filter.status}
            options={STATUS_OPTIONS}
            onChange={(v) => setFilter((f) => ({ ...f, status: v }))}
          />
        </div>
      </div>

      {fetchError && (
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: '#450a0a', borderColor: '#ef4444' }}
        >
          <p className="text-sm" style={{ color: '#fca5a5' }}>{fetchError}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#334155', borderTopColor: '#6366f1' }}
          />
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Task List — 2/3 */}
          <div className="flex flex-col gap-2" style={{ width: '66%' }}>
            {filteredTasks.length === 0 ? (
              <div
                className="rounded-xl p-8 border text-center"
                style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
              >
                <p style={{ color: '#475569' }}>Filtre kriterlerine uyan görev bulunamadı.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  selected={selectedTask?.id === task.id}
                  onClick={handleSelectTask}
                />
              ))
            )}
          </div>

          {/* Detail Panel — 1/3 */}
          <div style={{ width: '34%' }}>
            {selectedTask ? (
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
                    ['Sprint', selectedTask.sprint || '-'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ color: '#475569' }}>{k}</p>
                      <p className="font-medium" style={{ color: '#94a3b8' }}>{v}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loadingPredict}
                  className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
                >
                  {loadingPredict ? 'Analiz ediliyor...' : '🤖 AI ile Tahmin Et'}
                </button>

                <AiResultPanel
                  type="sizing"
                  loading={loadingPredict}
                  result={prediction}
                  error={predictError}
                />

                {prediction && !loadingPredict && (
                  <button
                    onClick={handleAddToSprint}
                    className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                    style={{ backgroundColor: '#14532d', color: '#86efac', border: '1px solid #22c55e' }}
                  >
                    ✓ Sprinte Ekle
                  </button>
                )}

                {/* Blokaj Çözümü */}
                <div
                  className="rounded-lg p-4 border flex flex-col gap-3"
                  style={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                >
                  <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                    🚫 Blokaj Çözümü
                  </p>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows={3}
                    placeholder={
                      selectedTask.status === 'Blocked'
                        ? 'Neden bloke olduğunu açıklayın...'
                        : 'Olası bir blokaj sebebini girin...'
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm border resize-none focus:outline-none focus:border-orange-500 transition-colors"
                    style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  />
                  <button
                    onClick={handleUnblock}
                    disabled={loadingUnblock}
                    className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#7c2d12', color: '#fdba74', border: '1px solid #ea580c' }}
                  >
                    {loadingUnblock ? 'Analiz ediliyor...' : '🚫 AI ile Çöz'}
                  </button>
                  <AiResultPanel
                    type="unblock"
                    loading={loadingUnblock}
                    result={unblockResult}
                    error={unblockError}
                  />
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl border p-8 text-center"
                style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
              >
                <p className="text-3xl mb-3">👈</p>
                <p className="text-sm" style={{ color: '#475569' }}>
                  Detayları görüntülemek için bir görev seçin
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
