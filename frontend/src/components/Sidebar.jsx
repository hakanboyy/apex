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
      style={{
        background: 'linear-gradient(180deg, #090f1d 0%, #07101e 100%)',
        borderColor: '#1c2e50',
        minHeight: '100vh',
        boxShadow: '1px 0 0 rgba(99,102,241,0.06)',
      }}
    >
      {/* Logo / Title */}
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
          >
            🤖
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#818cf8' }}>AI Agile</p>
            <p className="text-sm font-bold" style={{ color: '#e8f0fa' }}>Manager</p>
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
                  isActive ? '' : 'hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)',
                      color: '#a5b4fc',
                      borderLeft: '2px solid #6366f1',
                      paddingLeft: '10px',
                    }
                  : { color: '#4e6e98' }
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-2 pt-4 border-t flex flex-col gap-3" style={{ borderColor: '#1c2e50' }}>
        <JiraStatus />
        <p className="text-xs font-medium text-center" style={{ color: '#243860' }}>
          IFTS Hackathon 2026
        </p>
      </div>
    </aside>
  )
}
