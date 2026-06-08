import React from 'react'

const priorityConfig = {
  High: { label: 'High', bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
  Medium: { label: 'Medium', bg: '#78350f', text: '#fcd34d', border: '#f59e0b' },
  Low: { label: 'Low', bg: '#14532d', text: '#86efac', border: '#22c55e' },
}

const typeConfig = {
  Story: { label: 'Story', bg: '#312e81', text: '#a5b4fc', border: '#6366f1' },
  Bug: { label: 'Bug', bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
  Task: { label: 'Task', bg: '#1e293b', text: '#94a3b8', border: '#475569' },
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
          backgroundColor: selected ? '#1e3a5f' : '#1e293b',
          borderColor: selected ? '#6366f1' : '#334155',
        }}
      >
        <p className="text-xs mb-1" style={{ color: '#475569' }}>#{task.id}</p>
        <p className="text-sm font-medium truncate mb-2" style={{ color: '#f1f5f9' }}>{task.title}</p>
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
      className="p-4 rounded-lg border cursor-pointer transition-all duration-150 hover:border-indigo-400"
      style={{
        backgroundColor: selected ? '#1e3a5f' : '#1e293b',
        borderColor: selected ? '#6366f1' : '#334155',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-mono" style={{ color: '#475569' }}>#{task.id}</p>
        <div className="flex gap-1 flex-wrap justify-end">
          <Badge {...type} />
          <Badge {...priority} />
          {task.size && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
              style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderColor: '#334155' }}
            >
              {task.size} SP
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-medium leading-snug" style={{ color: '#f1f5f9' }}>{task.title}</p>
      {task.assignee && (
        <p className="text-xs mt-2" style={{ color: '#64748b' }}>
          Atanan: <span style={{ color: '#94a3b8' }}>{task.assignee}</span>
        </p>
      )}
      {task.status && (
        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
          Durum: <span style={{ color: '#94a3b8' }}>{task.status}</span>
        </p>
      )}
    </div>
  )
}
