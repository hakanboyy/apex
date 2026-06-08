const express = require('express')
const router = express.Router()
const { db } = require('../db/database')
const { getTeamMembers } = require('../services/jira')

router.get('/', async (req, res) => {
  try {
    const members = await getTeamMembers()
    res.json(members)
  } catch (err) {
    console.warn('[Jira] team fallback:', err.message)
    res.json(db.findTeamMembers())
  }
})

router.get('/:id', async (req, res) => {
  try {
    const members = await getTeamMembers()
    const member = members.find(m => m.id === req.params.id)
    if (!member) return res.status(404).json({ error: 'Ekip üyesi bulunamadı' })
    res.json(member)
  } catch (err) {
    console.warn('[Jira] team/:id fallback:', err.message)
    const member = db.findTeamMember(req.params.id)
    if (!member) return res.status(404).json({ error: 'Ekip üyesi bulunamadı' })
    res.json(member)
  }
})

module.exports = router
