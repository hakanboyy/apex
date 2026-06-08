import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts'
import AiResultPanel from '../components/AiResultPanel'
import { getDashboard, generateSprintReview } from '../services/api'

function MetricCard({ title, value, subtitle, color, icon }) {
  return (
    <div
      className="rounded-xl p-5 border flex flex-col gap-2"
      style={{
        background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)',
        borderColor: '#1c2e50',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4e6e98' }}>
          {title}
        </p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold" style={{ color: color || '#e8f0fa' }}>{value}</p>
      {subtitle && <p className="text-xs" style={{ color: '#4e6e98' }}>{subtitle}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg p-3 border text-sm"
        style={{ backgroundColor: '#0d1a30', borderColor: '#1c2e50', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
      >
        <p className="font-medium mb-1" style={{ color: '#e8f0fa' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sprintReview, setSprintReview] = useState(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await getDashboard()
        setDashboardData(res.data)
      } catch (err) {
        setError(err.message || 'Dashboard verileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSprintReview = async () => {
    setShowReview(true)
    setLoadingReview(true)
    setReviewError(null)
    try {
      const sprintId = dashboardData?.metrics?.currentSprint?.id || 'sprint-6'
      const res = await generateSprintReview(sprintId)
      setSprintReview(res.data?.result || res.data)
    } catch (err) {
      setReviewError(err.message || 'Sprint review oluşturulamadı')
    } finally {
      setLoadingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#1c2e50', borderTopColor: '#6366f1' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 border max-w-lg"
        style={{ backgroundColor: '#380808', borderColor: '#7f1d1d' }}
      >
        <p className="font-semibold mb-1" style={{ color: '#fca5a5' }}>Veri Yüklenemedi</p>
        <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || {}
  const currentSprint = metrics.currentSprint || {}
  const velocity = dashboardData?.velocity || []

  const completionPct = metrics.completionRate ?? 0
  const completionColor = completionPct >= 80 ? '#22c55e' : completionPct >= 50 ? '#f59e0b' : '#ef4444'

  const loadPct = metrics.teamCapacity
    ? Math.round((metrics.totalCurrentLoad / metrics.teamCapacity) * 100)
    : 0
  const loadColor = loadPct <= 80 ? '#22c55e' : loadPct <= 95 ? '#f59e0b' : '#ef4444'

  const velocityChartData = velocity.map((v) => ({
    name: v.name.replace('Sprint ', 'S'),
    Planlanan: v.planned,
    Tamamlanan: v.completed,
  }))

  const lineChartData = velocity.map((v) => ({
    name: v.name.replace('Sprint ', 'S'),
    Velocity: v.completed,
  }))

  const carryoverChartData = velocity.map((v) => ({
    name: v.name.replace('Sprint ', 'S'),
    Carryover: v.carryover,
  }))

  const hasCarryoverTrend = velocity.some((v) => v.carryover !== undefined)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#e8f0fa' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#4e6e98' }}>
          {currentSprint.name || 'Aktif Sprint'} &mdash; Genel Bakış
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Sprint Tamamlanma"
          value={`%${completionPct}`}
          subtitle={`${currentSprint.completed_points || 0} / ${currentSprint.planned_points || 0} SP`}
          color={completionColor}
          icon="🎯"
        />
        <MetricCard
          title="Kalan Gün"
          value={metrics.remainingDays ?? '-'}
          subtitle="gün kaldı"
          color="#f59e0b"
          icon="📅"
        />
        <MetricCard
          title="Takım Kapasitesi"
          value={`%${loadPct}`}
          subtitle={`${metrics.totalCurrentLoad || 0} / ${metrics.teamCapacity || 0} saat yük`}
          color={loadColor}
          icon="👥"
        />
        <MetricCard
          title="Backlog Task"
          value={metrics.backlogCount ?? '-'}
          subtitle="bekleyen görev"
          color="#818cf8"
          icon="📋"
        />
        {metrics.carryoverCount !== undefined && (
          <MetricCard
            title="Carryover Task"
            value={metrics.carryoverCount}
            subtitle={`%${metrics.carryoverRate || 0} geçişkenlik`}
            color="#f59e0b"
            icon="🔄"
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart + Carryover Trend */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl p-5 border"
            style={{ background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: '#e8f0fa' }}>
              Sprint Performansı
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={velocityChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2e50" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4e6e98', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4e6e98', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Legend wrapperStyle={{ color: '#7090b8', fontSize: 12 }} />
                <Bar dataKey="Planlanan" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tamamlanan" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {hasCarryoverTrend && (
            <div
              className="rounded-xl p-5 border"
              style={{ background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
            >
              <p className="text-sm font-semibold mb-4" style={{ color: '#e8f0fa' }}>
                Carryover Trendi
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={carryoverChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2e50" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#4e6e98', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4e6e98', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1c2e50' }} />
                  <Line
                    type="monotone"
                    dataKey="Carryover"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div
          className="rounded-xl p-5 border"
          style={{ background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: '#e8f0fa' }}>
            Velocity Trendi
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineChartData}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e50" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#4e6e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4e6e98', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1c2e50' }} />
              <Line
                type="monotone"
                dataKey="Velocity"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6, fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint Review Section */}
      <div
        className="rounded-xl p-5 border"
        style={{ background: 'linear-gradient(135deg, #0d1a30 0%, #101e35 100%)', borderColor: '#1c2e50', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#e8f0fa' }}>Sprint Review</p>
            <p className="text-xs mt-0.5" style={{ color: '#4e6e98' }}>
              AI ile sprint performansını analiz et
            </p>
          </div>
          <button
            onClick={handleSprintReview}
            disabled={loadingReview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            {loadingReview ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
                />
                Analiz yapılıyor...
              </>
            ) : (
              <>🤖 Sprint Review Oluştur</>
            )}
          </button>
        </div>

        {showReview && (
          <AiResultPanel
            type="review"
            loading={loadingReview}
            result={sprintReview}
            error={reviewError}
          />
        )}
      </div>
    </div>
  )
}
