const OpenAI = require('openai')
require('dotenv').config()

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Sen deneyimli bir Agile Coach ve Senior Tech Lead'sin. Scrum/Kanban süreçleri, story point estimation ve yazılım geliştirme konusunda uzmansın. Yanıtlarını Türkçe ver. JSON formatı istendiğinde SADECE geçerli JSON döndür, başka metin ekleme.`

async function chat(userPrompt, fallback) {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0
    })
    return JSON.parse(response.choices[0].message.content)
  } catch (err) {
    if (fallback) {
      console.warn('[AI] API error, using demo fallback:', err.message)
      return fallback
    }
    throw err
  }
}

async function predictSizing(task, sprintHistory) {
  const velocityArray = sprintHistory.map(s => s.completed_points)
  const avgVelocity = velocityArray.length > 0
    ? Math.round(velocityArray.reduce((s, v) => s + v, 0) / velocityArray.length)
    : 0

  const sizeMap = { XS: 2, S: 3, M: 5, L: 8, XL: 13 }
  const basePoints = sizeMap[task.size] || (avgVelocity > 0 ? Math.round(avgVelocity / 4) : 5)
  return chat(`Aşağıdaki task için story point tahmini yap:

Task Bilgileri:
- ID: ${task.id}
- Başlık: ${task.title}
- Açıklama: ${task.description || 'Yok'}
- Tip: ${task.type}, Öncelik: ${task.priority}, Boyut: ${task.size}, Epic: ${task.epic}

Sprint Geçmişi (Ortalama Velocity: ${avgVelocity} puan):
${sprintHistory.map(s => `- ${s.name}: ${s.completed_points}/${s.planned_points} puan`).join('\n')}

JSON formatında yanıt ver:
{"predictedPoints": <sayı>, "confidence": "<düşük|orta|yüksek>", "reasoning": "<açıklama>", "risks": ["<risk1>", "<risk2>"]}`, {
    predictedPoints: basePoints,
    confidence: 'orta',
    reasoning: `"${task.title}" görevi ${task.type} tipinde ve ${task.priority} öncelikli. Boyut ${task.size || 'belirtilmemiş'}, takım velocity ortalaması ${avgVelocity} puan. Mevcut bilgilere göre ${basePoints} story point uygun görünmektedir.`,
    risks: ['Gereksinim belirsizliği olabilir', 'Bağımlı servisler gecikmeye yol açabilir']
  })
}

async function decomposeTask(task, teamMembers) {
  const teamStr = teamMembers.map(m => {
    const available = (m.capacity || 0) - (m.current_load || 0)
    return `- ${m.name} (${m.role}): Beceriler: ${(m.skills || []).join(', ')}, Müsait: ${available}h`
  }).join('\n')

  const firstMember = teamMembers[0] || { id: 'u1', name: 'Takım Üyesi' }
  const secondMember = teamMembers[1] || firstMember
  return chat(`Aşağıdaki task'ı alt görevlere böl ve ekip üyelerine ata:

Task: ${task.title} (${task.type}, ${task.priority})
Açıklama: ${task.description || 'Yok'}
Boyut: ${task.size}, Epic: ${task.epic}

Ekip:
${teamStr}

JSON formatında yanıt ver:
{"subtasks": [{"title": "<başlık>", "type": "<Frontend|Backend|DB|Test|DevOps>", "estimatedHours": <sayı>, "assignedTo": "<u1|u2|u3|u4>", "assignedName": "<ad>", "reason": "<gerekçe>"}], "totalEstimate": <toplam saat>}`, {
    subtasks: [
      { title: `${task.title} — Analiz ve Tasarım`, type: 'Backend', estimatedHours: 4, assignedTo: firstMember.id, assignedName: firstMember.name, reason: 'Teknik analiz ve mimari karar için en uygun kişi' },
      { title: `${task.title} — Geliştirme`, type: 'Backend', estimatedHours: 8, assignedTo: firstMember.id, assignedName: firstMember.name, reason: 'Asıl geliştirme iş yükü' },
      { title: `${task.title} — Test`, type: 'Test', estimatedHours: 3, assignedTo: secondMember.id, assignedName: secondMember.name, reason: 'Bağımsız test için farklı kişi tercih edilir' }
    ],
    totalEstimate: 15
  })
}

async function generateSprintReview(sprint, tasks) {
  const done = tasks.filter(t => t.status === 'Done')
  const notDone = tasks.filter(t => t.status !== 'Done')
  const rate = sprint.planned_points > 0
    ? Math.round((sprint.completed_points / sprint.planned_points) * 100) : 0

  return chat(`Sprint review raporu oluştur:

Sprint: ${sprint.name} (${sprint.start_date} - ${sprint.end_date})
Planlanan: ${sprint.planned_points} puan, Tamamlanan: ${sprint.completed_points} puan (%${rate})

Tamamlanan (${done.length}): ${done.map(t => t.title).join(', ') || 'Yok'}
Tamamlanmayan (${notDone.length}): ${notDone.map(t => t.title).join(', ') || 'Yok'}

JSON formatında yanıt ver:
{"summary": "<özet>", "achievements": ["<başarı1>"], "healthScore": <0-100>, "recommendations": ["<öneri1>"], "nextSprintSuggestions": ["<öneri1>"]}`, {
    summary: `${sprint.name} sprinti ${sprint.planned_points} puanlık hedefle başladı. Sprint sonunda ${sprint.completed_points} puan tamamlandı (%${rate} tamamlanma). ${done.length} görev başarıyla kapatılırken ${notDone.length} görev bir sonraki sprinte taşındı.`,
    achievements: [
      `${done.length} görev başarıyla tamamlandı`,
      `${sprint.completed_points} story point değer üretildi`,
      rate >= 70 ? 'Sprint hedefine büyük ölçüde ulaşıldı' : 'Takım mevcut kısıtlara rağmen çalışmaya devam etti'
    ],
    healthScore: Math.min(100, Math.max(10, rate)),
    recommendations: [
      notDone.length > 0 ? `${notDone.length} tamamlanmayan görev bir sonraki sprinte öncelikli alınmalı` : 'Sprint planlaması başarılı, mevcut ritmi koruyun',
      'Taşınan görevler için blokaj nedenleri retrospektifte ele alınmalı',
      'Velocity tutarlılığı için sprint kapasitesi gözden geçirilmeli'
    ],
    nextSprintSuggestions: [
      `Hedef velocity: ${Math.round(sprint.planned_points * 0.9)} puan`,
      'Taşınan görevlere sprint başında öncelik verilmesi önerilir',
      'Teknik borç için kapasitenin %15\'i ayrılmalı'
    ]
  })
}

async function suggestUnblock(task, blockReason) {
  return chat(`Bu task bloke durumda. Çözüm önerileri sun:
Task: ${task.title}
Açıklama: ${task.description || 'Yok'}
Blokaj Nedeni: ${blockReason || 'Belirtilmemiş'}

JSON: {"suggestions": ["<öneri1>", "<öneri2>", "<öneri3>"], "rootCause": "<temel neden>", "priority": "<high|medium|low>", "estimatedResolutionDays": <sayı>}`, {
    suggestions: [
      'Blokajı oluşturan bağımlılık sahibiyle acil toplantı düzenleyin',
      'Geçici bir workaround (mock/stub) geliştirerek parallel ilerleme sağlayın',
      'Scrum Master veya Tech Lead\'i durumdan haberdar ederek escalate edin'
    ],
    rootCause: blockReason
      ? `"${blockReason}" nedeniyle görev ilerleyemiyor. Dış bağımlılık veya belirsiz gereksinimler temel etken olabilir.`
      : `"${task.title}" görevi dış bağımlılık veya kaynak eksikliği nedeniyle bloke görünüyor.`,
    priority: 'high',
    estimatedResolutionDays: 2
  })
}

module.exports = { predictSizing, decomposeTask, generateSprintReview, suggestUnblock }
