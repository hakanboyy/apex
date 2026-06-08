import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

function JiraStatus() {
  const [status, setStatus] = useState('checking') // 'ok' | 'error' | 'checking'
  useEffect(() => {
    fetch('http://localhost:3001/api/backlog?maxResults=1')
      .then(r => r.ok ? setStatus('ok') : setStatus('error'))
      .catch(() => setStatus('error'))
  }, [])
  const color = status === 'ok' ? '#22c55e' : status === 'error' ? '#ef4444' : '#f59e0b'
  const label = status === 'ok' ? 'Jira Bağlı' : status === 'error' ? 'Jira Bağlantısız' : 'Kontrol ediliyor'
  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  )
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/backlog', label: 'Backlog', icon: '📋' },
  { to: '/decompose', label: 'Decompose', icon: '⚡' },
]

export default function Sidebar() {
  return (
    <aside
      className="w-64 flex flex-col justify-between py-6 px-4 border-r"
      style={{ backgroundColor: '#1e293b', borderColor: '#334155', minHeight: '100vh' }}
    >
      {/* Logo / Title */}
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="text-3xl">🤖</span>
          <div>
            <p className="text-xs font-medium" style={{ color: '#6366f1' }}>AI Agile</p>
            <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-slate-700'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: '#6366f1', color: '#ffffff' }
                  : { color: '#94a3b8' }
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-2 pt-4 border-t flex flex-col gap-3" style={{ borderColor: '#334155' }}>
        <JiraStatus />
        <p className="text-xs font-medium text-center" style={{ color: '#475569' }}>
          IFTS Hackathon 2026
        </p>
      </div>
    </aside>
  )
}
