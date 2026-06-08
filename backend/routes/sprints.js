const express = require('express')
const router = express.Router()
const { db } = require('../db/database')
const {
  getActiveSprint,
  getSprintIssues,
  getClosedSprints,
  getSprintVelocity
} = require('../services/jira')

router.get('/', async (req, res) => {
  try {
    const [activeSprint, closedSprints] = await Promise.all([
      getActiveSprint(),
      getClosedSprints(20)
    ])

    let currentWithTasks = null
    if (activeSprint) {
      const tasks = await getSprintIssues(activeSprint.id)
      const velocity = await getSprintVelocity(activeSprint.id)
      currentWithTasks = {
        ...activeSprint,
        planned_points: velocity.planned_points,
        completed_points: velocity.completed_points,
        tasks
      }
    }

    // Son 6 kapalı sprint
    const history = closedSprints.slice(-6).reverse()

    res.json({ current: currentWithTasks, history })
  } catch (err) {
    console.warn('[Jira] sprints fallback:', err.message)
    try {
      const current = db.findActiveSprint()
      const currentWithTasks = current
        ? { ...current, tasks: db.findTasksBySprint(current.id) }
        : null
      const history = db.findSprints({ status: 'completed' }).reverse()
      res.json({ current: currentWithTasks, history })
    } catch (dbErr) {
      res.status(500).json({ error: 'Sunucu hatası', details: dbErr.message })
    }
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params

  // Mock sprint ID pattern (e.g. 'sprint-6')
  if (/^sprint-\d+$/.test(id)) {
    try {
      const sprint = db.findSprint(id)
      if (!sprint) return res.status(404).json({ error: 'Sprint bulunamadı' })
      const tasks = db.findTasksBySprint(sprint.id)
      return res.json({ ...sprint, tasks })
    } catch (err) {
      return res.status(500).json({ error: 'Sunucu hatası', details: err.message })
    }
  }

  // Real Jira sprint ID
  try {
    const tasks = await getSprintIssues(id)
    const velocity = await getSprintVelocity(id)
    res.json({
      id,
      tasks,
      planned_points: velocity.planned_points,
      completed_points: velocity.completed_points
    })
  } catch (err) {
    console.warn(`[Jira] sprint/${id} fallback:`, err.message)
    try {
      const sprint = db.findSprint(id)
      if (!sprint) return res.status(404).json({ error: 'Sprint bulunamadı' })
      const tasks = db.findTasksBySprint(sprint.id)
      res.json({ ...sprint, tasks })
    } catch (dbErr) {
      res.status(500).json({ error: 'Sunucu hatası', details: dbErr.message })
    }
  }
})

module.exports = router
