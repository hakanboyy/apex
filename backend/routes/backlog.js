const express = require('express')
const router = express.Router()
const { db } = require('../db/database')
const { getBacklogIssues } = require('../services/jira')

router.get('/', async (req, res) => {
  try {
    let tasks = await getBacklogIssues(100)

    const { status, priority, type } = req.query
    if (status) tasks = tasks.filter(t => t.status === status)
    if (priority) tasks = tasks.filter(t => t.priority === priority)
    if (type) tasks = tasks.filter(t => t.type === type)

    res.json(tasks)
  } catch (err) {
    console.warn('[Jira] backlog fallback:', err.message)
    res.json(db.findTasks(req.query))
  }
})

router.get('/:id', async (req, res) => {
  try {
    const tasks = await getBacklogIssues(100)
    const task = tasks.find(t => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Task bulunamadı' })
    res.json(task)
  } catch (err) {
    console.warn('[Jira] backlog/:id fallback:', err.message)
    const task = db.findTask(req.params.id)
    if (!task) return res.status(404).json({ error: 'Task bulunamadı' })
    res.json(task)
  }
})

module.exports = router
