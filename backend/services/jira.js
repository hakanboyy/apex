const https = require('https')
require('dotenv').config()

const JIRA_BASE = process.env.JIRA_BASE_URL || 'https://jira.turkcell.com.tr'
const BOARD_ID = process.env.JIRA_BOARD_ID || '23461'
const TOKEN = process.env.JIRA_TOKEN || ''

const agent = new https.Agent({ rejectUnauthorized: false })

function spToSize(sp) {
  if (sp == null) return null
  if (sp <= 2) return 'XS'
  if (sp <= 3) return 'S'
  if (sp <= 5) return 'M'
  if (sp <= 8) return 'L'
  return 'XL'
}

function mapStatus(statusName) {
  if (!statusName) return 'In Sprint'
  const s = statusName.trim()
  if (s === 'Done') return 'Done'
  if (s === 'To Do') return 'To Do'
  if (s === 'Blocked') return 'Blocked'
  if (s === 'Development' || s === 'In Progress') return 'In Sprint'
  return 'In Sprint'
}

function extractDescription(fields) {
  const desc = fields.description
  if (!desc) return ''
  // ADF format
  if (desc && typeof desc === 'object' && desc.content) {
    try {
      return desc.content?.[0]?.content?.[0]?.text || ''
    } catch {
      return ''
    }
  }
  // Plain string
  if (typeof desc === 'string') return desc
  return ''
}

function issueToTask(issue, overrideStatus) {
  const fields = issue.fields || {}
  const sp = fields.customfield_10028 != null ? Number(fields.customfield_10028) : null
  const status = overrideStatus !== undefined
    ? overrideStatus
    : mapStatus(fields.status?.name)

  return {
    id: issue.key,
    title: fields.summary || '',
    description: extractDescription(fields),
    type: fields.issuetype?.name || 'Task',
    priority: fields.priority?.name || 'Medium',
    size: spToSize(sp),
    story_points: sp,
    status,
    epic: fields.labels?.[0] || 'General',
    sprint_id: null,
    assignee: fields.assignee?.displayName || null
  }
}

async function jiraGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, JIRA_BASE)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      agent,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}`))
          }
        } else {
          reject(new Error(`Jira HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Jira request timeout'))
    })
    req.end()
  })
}

async function getBacklogIssues(maxResults = 50) {
  console.log('[Jira] fetching backlog...')
  const fields = 'summary,status,priority,issuetype,assignee,customfield_10028,description,labels'
  const data = await jiraGet(
    `/rest/agile/1.0/board/${BOARD_ID}/backlog?maxResults=${maxResults}&fields=${fields}`
  )
  const issues = data.issues || []
  console.log(`[Jira] backlog: ${issues.length} issues`)
  return issues.map(issue => issueToTask(issue, 'Backlog'))
}

async function getActiveSprint() {
  console.log('[Jira] fetching active sprint...')
  const data = await jiraGet(`/rest/agile/1.0/board/${BOARD_ID}/sprint?state=active`)
  const values = data.values || []
  if (!values.length) return null
  const s = values[0]
  console.log(`[Jira] active sprint: ${s.name} (${s.id})`)
  return {
    id: s.id,
    name: s.name,
    start_date: s.startDate ? s.startDate.split('T')[0] : null,
    end_date: s.endDate ? s.endDate.split('T')[0] : null,
    status: 'active',
    planned_points: 0,
    completed_points: 0
  }
}

async function getSprintIssues(sprintId, maxResults = 100) {
  console.log(`[Jira] fetching sprint issues for sprint ${sprintId}...`)
  const fields = 'summary,status,priority,issuetype,assignee,customfield_10028,description,labels'
  const data = await jiraGet(
    `/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=${maxResults}&fields=${fields}`
  )
  const issues = data.issues || []
  console.log(`[Jira] sprint ${sprintId}: ${issues.length} issues`)
  return issues.map(issue => issueToTask(issue))
}

async function getClosedSprints(maxResults = 20) {
  console.log('[Jira] fetching closed sprints...')
  const data = await jiraGet(
    `/rest/agile/1.0/board/${BOARD_ID}/sprint?state=closed&maxResults=${maxResults}`
  )
  const values = data.values || []
  console.log(`[Jira] closed sprints: ${values.length}`)
  return values.map(s => ({
    id: s.id,
    name: s.name,
    start_date: s.startDate ? s.startDate.split('T')[0] : null,
    end_date: s.endDate ? s.endDate.split('T')[0] : null,
    status: 'completed',
    planned_points: 0,
    completed_points: 0
  }))
}

async function getSprintVelocity(sprintId) {
  const issues = await getSprintIssues(sprintId)
  let planned_points = 0
  let completed_points = 0
  for (const issue of issues) {
    const sp = issue.story_points || 0
    planned_points += sp
    if (issue.status === 'Done') completed_points += sp
  }
  return { planned_points, completed_points }
}

async function getTeamMembers() {
  console.log('[Jira] fetching team members from active sprint...')
  const sprint = await getActiveSprint()
  if (!sprint) return []

  const issues = await getSprintIssues(sprint.id)

  const memberMap = {}
  for (const issue of issues) {
    const name = issue.assignee
    if (!name) continue
    if (!memberMap[name]) {
      memberMap[name] = { name, load: 0 }
    }
    memberMap[name].load += issue.story_points || 0
  }

  return Object.values(memberMap).map(m => ({
    id: m.name.replace(/\s+/g, '-').toLowerCase(),
    name: m.name,
    role: 'Team Member',
    skills: [],
    capacity: 40,
    current_load: m.load
  }))
}

module.exports = {
  jiraGet,
  getBacklogIssues,
  getActiveSprint,
  getSprintIssues,
  getClosedSprints,
  getSprintVelocity,
  getTeamMembers
}
