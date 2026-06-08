import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Backlog from './pages/Backlog'
import Decompose from './pages/Decompose'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/decompose" element={<Decompose />} />
        </Routes>
      </main>
    </div>
  )
}
