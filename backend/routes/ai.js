const express = require('express')
const router = express.Router()
const { db } = require('../db/database')
const { predictSizing, decomposeTask, generateSprintReview, suggestUnblock } = require('../services/claude')
const { getActiveSprint, getSprintIssues, getClosedSprints, getSprintVelocity, getBacklogIssues, jiraGet } = require('../services/jira')

router.post('/predict-sizing', async (req, res) => {
  try {
    const { taskId } = req.body
    if (!taskId) return res.status(400).json({ error: 'taskId gereklidir' })

    // Try Jira first, fallback to mock store
    let task = null
    try {
      const tasks = await getBacklogIssues(100)
      task = tasks.find(t => t.id === taskId)
    } catch (jiraErr) {
      console.warn('[Jira] predict-sizing backlog fallback:', jiraErr.message)
    }
    if (!task) task = db.findTask(taskId)
    if (!task) return res.status(404).json({ error: 'Task bulunamadı' })

    const sprintHistory = db.findSprints({ status: 'completed' })
    const result = await predictSizing(task, sprintHistory)
    db.saveAiResult(taskId, 'sizing', JSON.stringify(result))

    res.json({ taskId, task: { id: task.id, title: task.title }, result })
  } catch (error) {
    console.error('predict-sizing error:', error)
    res.status(500).json({ error: 'AI tahmin hatası', details: error.message })
  }
})

router.post('/decompose', async (req, res) => {
  try {
    const { taskId } = req.body
    if (!taskId) return res.status(400).json({ error: 'taskId gereklidir' })

    // Try Jira first, fallback to mock store
    let task = null
    try {
      const tasks = await getBacklogIssues(100)
      task = tasks.find(t => t.id === taskId)
    } catch (jiraErr) {
      console.warn('[Jira] decompose backlog fallback:', jiraErr.message)
    }
    if (!task) task = db.findTask(taskId)
    if (!task) return res.status(404).json({ error: 'Task bulunamadı' })

    const teamMembers = db.findTeamMembers()
    const result = await decomposeTask(task, teamMembers)
    db.saveAiResult(taskId, 'decomposition', JSON.stringify(result))

    res.json({ taskId, task: { id: task.id, title: task.title }, result })
  } catch (error) {
    console.error('decompose error:', error)
    res.status(500).json({ error: 'AI decompose hatası', details: error.message })
  }
})

router.post('/sprint-review', async (req, res) => {
  try {
    const { sprintId } = req.body
    if (!sprintId) return res.status(400).json({ error: 'sprintId gereklidir' })

    let sprint = null
    let tasks = []

    // Try Jira for numeric sprint IDs
    if (/^\d+$/.test(String(sprintId))) {
      try {
        const sprintData = await jiraGet(`/rest/agile/1.0/sprint/${sprintId}`)
        sprint = {
          id: sprintData.id,
          name: sprintData.name,
          start_date: sprintData.startDate ? sprintData.startDate.split('T')[0] : null,
          end_date: sprintData.endDate ? sprintData.endDate.split('T')[0] : null
        }
        tasks = await getSprintIssues(sprintId)
        const vel = tasks.reduce((acc, t) => {
          acc.planned += t.story_points || 0
          if (t.status === 'Done') acc.completed += t.story_points || 0
          return acc
        }, { planned: 0, completed: 0 })
        sprint.planned_points = vel.planned
        sprint.completed_points = vel.completed
      } catch (jiraErr) {
        console.warn('[Jira] sprint-review Jira fallback:', jiraErr.message)
      }
    }

    if (!sprint) {
      sprint = db.findSprint(sprintId)
      if (!sprint) return res.status(404).json({ error: 'Sprint bulunamadı' })
      tasks = db.findTasksBySprint(sprintId)
    }

    const result = await generateSprintReview(sprint, tasks)
    db.saveAiResult(sprintId, 'sprint_review', JSON.stringify(result))

    res.json({ sprintId, sprint: { id: sprint.id, name: sprint.name }, result })
  } catch (error) {
    console.error('sprint-review error:', error)
    res.status(500).json({ error: 'AI sprint review hatası', details: error.message })
  }
})

router.post('/suggest-unblock', async (req, res) => {
  try {
    const { taskId, blockReason } = req.body
    if (!taskId) return res.status(400).json({ error: 'taskId gereklidir' })

    // Try Jira first, then sprint issues, then mock store
    let task = null
    try {
      const backlogTasks = await getBacklogIssues(100)
      task = backlogTasks.find(t => t.id === taskId)
      if (!task) {
        const activeSprint = await getActiveSprint()
        if (activeSprint) {
          const sprintTasks = await getSprintIssues(activeSprint.id)
          task = sprintTasks.find(t => t.id === taskId)
        }
      }
    } catch (jiraErr) {
      console.warn('[Jira] suggest-unblock fallback:', jiraErr.message)
    }
    if (!task) task = db.findTask(taskId)
    if (!task) return res.status(404).json({ error: 'Task bulunamadı' })

    const result = await suggestUnblock(task, blockReason)
    db.saveAiResult(taskId, 'unblock', JSON.stringify(result))

    res.json({ taskId, task: { id: task.id, title: task.title }, result })
  } catch (error) {
    console.error('suggest-unblock error:', error)
    res.status(500).json({ error: 'AI unblock hatası', details: error.message })
  }
})

router.get('/dashboard', async (req, res) => {
  try {
    // Try Jira data first
    let currentSprint = null
    let sprintTasks = []
    let velocityData = []
    let useJira = false

    try {
      currentSprint = await getActiveSprint()
      if (currentSprint) {
        sprintTasks = await getSprintIssues(currentSprint.id)
        const vel = await getSprintVelocity(currentSprint.id)
        currentSprint.planned_points = vel.planned_points
        currentSprint.completed_points = vel.completed_points
      }

      // Closed sprints for velocity chart (last 6)
      const closedSprints = await getClosedSprints(20)
      const last6 = closedSprints.slice(-5)

      const velocityResults = await Promise.allSettled(
        last6.map(async (s) => {
          const v = await getSprintVelocity(s.id)
          return { name: s.name, planned: v.planned_points, completed: v.completed_points, velocity: v.completed_points }
        })
      )
      velocityData = velocityResults
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)

      useJira = true
    } catch (jiraErr) {
      console.warn('[Jira] dashboard Jira error, falling back to mock:', jiraErr.message)
    }

    if (useJira && currentSprint) {
      const completionRate = currentSprint.planned_points > 0
        ? Math.round((currentSprint.completed_points / currentSprint.planned_points) * 100)
        : 0

      const endDate = currentSprint.end_date ? new Date(currentSprint.end_date) : null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const remainingDays = endDate
        ? Math.max(0, Math.ceil((endDate - today) / 86400000))
        : 0

      // Carryover: tasks in active sprint that were created before sprint start
      let carryoverCount = 0
      if (currentSprint.start_date) {
        const sprintStart = new Date(currentSprint.start_date)
        carryoverCount = sprintTasks.filter(t => {
          // Basic heuristic: if we can't determine, skip
          return false
        }).length
        // Better: count tasks that are not 'Done' and status was carried
        // Since Jira doesn't easily expose previous sprint info per issue here,
        // use status as proxy: tasks with status 'To Do' or 'In Sprint' from prior sprint
        // Jira board history not available without extra API; keep at 0 unless explicitly known
        carryoverCount = sprintTasks.filter(t => t.status !== 'Done' && t.status !== 'In Sprint').length
      }
      const carryoverRate = sprintTasks.length > 0
        ? Math.round((carryoverCount / sprintTasks.length) * 100)
        : 0

      const activeTaskCount = sprintTasks.filter(t => t.status === 'In Sprint').length
      const blockedCount = sprintTasks.filter(t => t.status === 'Blocked').length

      const metrics = {
        currentSprint,
        completionRate,
        remainingDays,
        teamCapacity: 0,
        totalCurrentLoad: currentSprint.planned_points,
        activeTaskCount,
        backlogCount: 0,
        blockedCount,
        carryoverCount,
        carryoverRate
      }

      return res.json({ metrics, velocity: velocityData })
    }

    // Fallback to mock store
    const mockCurrentSprint = db.findActiveSprint()
    let completionRate = 0
    let remainingDays = 0

    if (mockCurrentSprint) {
      completionRate = mockCurrentSprint.planned_points > 0
        ? Math.round((mockCurrentSprint.completed_points / mockCurrentSprint.planned_points) * 100)
        : 0
      const endDate = new Date(mockCurrentSprint.end_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      remainingDays = Math.max(0, Math.ceil((endDate - today) / 86400000))
    }

    const teamStats = db.getTeamStats()
    const metrics = {
      currentSprint: mockCurrentSprint || null,
      completionRate,
      remainingDays,
      teamCapacity: teamStats.totalCapacity,
      totalCurrentLoad: teamStats.totalLoad,
      activeTaskCount: db.countTasks('In Sprint'),
      backlogCount: db.countTasks('Backlog'),
      carryoverCount: 0,
      carryoverRate: 0
    }

    const allSprints = db.findSprints()
    const velocity = allSprints.slice(-5).map(s => ({
      name: s.name,
      planned: s.planned_points,
      completed: s.completed_points,
      velocity: s.completed_points
    }))

    res.json({ metrics, velocity })
  } catch (error) {
    console.error('dashboard error:', error)
    res.status(500).json({ error: 'Dashboard hatası', details: error.message })
  }
})

module.exports = router
