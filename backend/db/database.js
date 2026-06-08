const store = {
  tasks: [],
  sprints: [],
  team_members: [],
  ai_results: []
}

let aiResultIdCounter = 1

const db = {
  // --- Tasks ---
  findTasks({ status, priority, type } = {}) {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }
    return store.tasks
      .filter(t => (!status || t.status === status) &&
                   (!priority || t.priority === priority) &&
                   (!type || t.type === type))
      .sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4))
  },
  findTask(id) {
    return store.tasks.find(t => t.id === id) || null
  },

  // --- Sprints ---
  findSprints(filters = {}) {
    return store.sprints.filter(s => {
      for (const [k, v] of Object.entries(filters)) {
        if (s[k] !== v) return false
      }
      return true
    }).sort((a, b) => a.start_date.localeCompare(b.start_date))
  },
  findSprint(id) {
    return store.sprints.find(s => s.id === id) || null
  },
  findActiveSprint() {
    return store.sprints.find(s => s.status === 'active') || null
  },
  findTasksBySprint(sprintId) {
    return store.tasks.filter(t => t.sprint_id === sprintId)
  },

  // --- Team ---
  findTeamMembers() {
    return store.team_members.map(m => ({ ...m, skills: Array.isArray(m.skills) ? m.skills : JSON.parse(m.skills) }))
  },
  findTeamMember(id) {
    const m = store.team_members.find(m => m.id === id)
    if (!m) return null
    return { ...m, skills: Array.isArray(m.skills) ? m.skills : JSON.parse(m.skills) }
  },

  // --- Metrics ---
  getTeamStats() {
    return store.team_members.reduce(
      (acc, m) => ({ totalCapacity: acc.totalCapacity + m.capacity, totalLoad: acc.totalLoad + m.current_load }),
      { totalCapacity: 0, totalLoad: 0 }
    )
  },
  countTasks(status) {
    return store.tasks.filter(t => t.status === status).length
  },

  // --- AI Results ---
  saveAiResult(task_id, result_type, result_json) {
    store.ai_results.push({ id: aiResultIdCounter++, task_id, result_type, result_json, created_at: new Date().toISOString() })
  },

  // --- Seed ---
  _store: store
}

function initDB() {
  // no-op: store is in-memory, seed.js populates it
}

module.exports = { db, initDB }
