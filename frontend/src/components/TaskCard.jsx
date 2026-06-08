import React from 'react'

const priorityConfig = {
  High: { label: 'High', bg: '#3d0e0e', text: '#fca5a5', border: '#ef4444' },
  Medium: { label: 'Medium', bg: '#3d2008', text: '#fcd34d', border: '#f59e0b' },
  Low: { label: 'Low', bg: '#0a2e1a', text: '#86efac', border: '#22c55e' },
}

const typeConfig = {
  Story: { label: 'Story', bg: '#1a1860', text: '#a5b4fc', border: '#6366f1' },
  Bug: { label: 'Bug', bg: '#3d0e0e', text: '#fca5a5', border: '#ef4444' },
  Task: { label: 'Task', bg: '#0d1a30', text: '#7090b8', border: '#1c2e50' },
}

function Badge({ label, bg, text, border }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
      style={{ backgroundColor: bg, color: text, borderColor: border }}
    >
      {label}
    </span>
  )
}

export default function TaskCard({ task, onClick, selected, compact }) {
  if (!task) return null

  const priority = priorityConfig[task.priority] || priorityConfig.Low
  const type = typeConfig[task.type] || typeConfig.Task

  if (compact) {
    return (
      <div
        onClick={() => onClick && onClick(task)}
        className="flex-shrink-0 w-52 p-3 rounded-lg border cursor-pointer transition-all duration-150 hover:border-indigo-500"
        style={{
          backgroundColor: selected ? '#1a3060' : '#0d1a30',
          borderColor: selected ? '#6366f1' : '#1c2e50',
          boxShadow: selected ? '0 0 0 1px rgba(99,102,241,0.2)' : 'none',
        }}
      >
        <p className="text-xs mb-1" style={{ color: '#3d5575' }}>#{task.id}</p>
        <p className="text-sm font-medium truncate mb-2" style={{ color: '#e8f0fa' }}>{task.title}</p>
        <div className="flex gap-1 flex-wrap">
          <Badge {...type} />
          <Badge {...priority} />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => onClick && onClick(task)}
      className="p-4 rounded-lg border cursor-pointer transition-all duration-150"
      style={{
        backgroundColor: selected ? '#1a3060' : '#0d1a30',
        borderColor: selected ? '#6366f1' : '#1c2e50',
        boxShadow: selected ? '0 0 0 1px rgba(99,102,241,0.2), 0 4px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-mono" style={{ color: '#3d5575' }}>#{task.id}</p>
        <div className="flex gap-1 flex-wrap justify-end">
          <Badge {...type} />
          <Badge {...priority} />
          {task.size && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
              style={{ backgroundColor: '#060e1a', color: '#7090b8', borderColor: '#1c2e50' }}
            >
              {task.size} SP
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-medium leading-snug" style={{ color: '#e8f0fa' }}>{task.title}</p>
      {task.assignee && (
        <p className="text-xs mt-2" style={{ color: '#4e6e98' }}>
          Atanan: <span style={{ color: '#7090b8' }}>{task.assignee}</span>
        </p>
      )}
      {task.status && (
        <p className="text-xs mt-1" style={{ color: '#4e6e98' }}>
          Durum: <span style={{ color: '#7090b8' }}>{task.status}</span>
        </p>
      )}
    </div>
  )
}
