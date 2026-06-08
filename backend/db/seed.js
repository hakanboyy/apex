const { db } = require('./database')

function runSeed() {
  const store = db._store

  store.tasks = [
    { id: 'PROJ-101', title: 'Kullanıcı Kimlik Doğrulama Sistemi', description: 'JWT tabanlı kullanıcı giriş, kayıt ve oturum yönetimi sistemi geliştir.', type: 'Story', priority: 'High', size: 'L', story_points: 8, status: 'Backlog', epic: 'Security', sprint_id: null },
    { id: 'PROJ-102', title: 'Ürün Arama Fonksiyonu', description: 'Elasticsearch entegrasyonu ile gelişmiş ürün arama ve filtreleme özelliği.', type: 'Story', priority: 'High', size: 'M', story_points: 5, status: 'Backlog', epic: 'Search', sprint_id: null },
    { id: 'PROJ-103', title: 'Ödeme Entegrasyonu', description: 'Stripe ve iyzico ödeme altyapısı entegrasyonu, güvenli ödeme akışı.', type: 'Story', priority: 'High', size: 'XL', story_points: null, status: 'Backlog', epic: 'Payment', sprint_id: null },
    { id: 'PROJ-104', title: 'Admin Panel Dashboard', description: 'Yönetici paneli için istatistik ve yönetim arayüzü.', type: 'Story', priority: 'Medium', size: 'L', story_points: null, status: 'Backlog', epic: 'Admin', sprint_id: null },
    { id: 'PROJ-105', title: 'E-posta Bildirim Servisi', description: 'Kullanıcı işlemleri için otomatik e-posta bildirim sistemi.', type: 'Task', priority: 'Medium', size: 'S', story_points: 3, status: 'Backlog', epic: 'Notifications', sprint_id: null },
    { id: 'PROJ-106', title: 'Performans Optimizasyonu', description: 'Veritabanı sorgu optimizasyonu ve önbellekleme stratejisi.', type: 'Task', priority: 'Low', size: 'M', story_points: null, status: 'Backlog', epic: 'Performance', sprint_id: null },
    { id: 'PROJ-107', title: 'API Rate Limiting', description: 'API isteklerini sınırlandırmak için rate limiting middleware.', type: 'Task', priority: 'High', size: 'S', story_points: 2, status: 'In Sprint', epic: 'Security', sprint_id: 'sprint-6' },
    { id: 'PROJ-108', title: 'Mobil Responsive Tasarım', description: 'Tüm sayfalar için mobil uyumlu responsive tasarım güncellemesi.', type: 'Story', priority: 'Medium', size: 'XL', story_points: null, status: 'Backlog', epic: 'UI/UX', sprint_id: null }
  ]

  store.sprints = [
    { id: 'sprint-1', name: 'Sprint 1', start_date: '2026-01-06', end_date: '2026-01-17', planned_points: 35, completed_points: 28, status: 'completed' },
    { id: 'sprint-2', name: 'Sprint 2', start_date: '2026-01-20', end_date: '2026-01-31', planned_points: 40, completed_points: 38, status: 'completed' },
    { id: 'sprint-3', name: 'Sprint 3', start_date: '2026-02-03', end_date: '2026-02-14', planned_points: 38, completed_points: 36, status: 'completed' },
    { id: 'sprint-4', name: 'Sprint 4', start_date: '2026-02-17', end_date: '2026-02-28', planned_points: 42, completed_points: 35, status: 'completed' },
    { id: 'sprint-5', name: 'Sprint 5', start_date: '2026-03-03', end_date: '2026-03-14', planned_points: 45, completed_points: 42, status: 'completed' },
    { id: 'sprint-6', name: 'Sprint 6', start_date: '2026-03-17', end_date: '2026-03-28', planned_points: 42, completed_points: 28, status: 'active' }
  ]

  store.team_members = [
    { id: 'u1', name: 'Ali Yılmaz', role: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS', 'Tailwind'], capacity: 40, current_load: 16 },
    { id: 'u2', name: 'Ayşe Kara', role: 'Backend Developer', skills: ['Node.js', 'PostgreSQL', 'REST API', 'Express'], capacity: 40, current_load: 24 },
    { id: 'u3', name: 'Mehmet Demir', role: 'Fullstack Developer', skills: ['React', 'Node.js', 'Python', 'Docker', 'AWS'], capacity: 40, current_load: 12 },
    { id: 'u4', name: 'Zeynep Ak', role: 'QA Engineer', skills: ['Cypress', 'Jest', 'Selenium', 'Test Automation'], capacity: 32, current_load: 8 }
  ]

  store.ai_results = []

  console.log('Seed data loaded: 8 tasks, 6 sprints, 4 team members.')
}

module.exports = { runSeed }
