require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { initDB } = require('./db/database')
const { runSeed } = require('./db/seed')

const backlogRoutes = require('./routes/backlog')
const sprintsRoutes = require('./routes/sprints')
const teamRoutes = require('./routes/team')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

initDB()
runSeed()

app.use('/api/backlog', backlogRoutes)
app.use('/api/sprints', sprintsRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Sunucu hatası', details: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
