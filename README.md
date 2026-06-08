# 🚀 APEX — Agile Productivity & AI Integration Platform

APEX, yazılım ekiplerinin Agile (Scrum/Kanban) süreçlerini yapay zeka gücüyle optimize eden, gerçek zamanlı **Jira Entegrasyonu** ve esnek **Yerel Fallback (Mock) Modu** barındıran akıllı bir Agile yönetim ve asistanlık platformudur.

Proje, deneyimli bir **Agile Coach** ve **Senior Tech Lead** rolündeki yapay zeka ajanlarını (OpenAI GPT-4o) projenizin iş listesine, takım yetkinliklerine ve geçmiş performansına entegre ederek planlama ve geliştirme aşamalarındaki sürtünmeleri sıfıra indirmeyi hedefler.

---

## 🌟 Öne Çıkan Özellikler

### 1. 📂 Akıllı Task Kırılımı ve Görev Atama (Decompose Task)
*   **Otomatik Ayrıştırma:** Büyük ve karmaşık taskları yazılım mimarisine uygun olarak **Frontend, Backend, DB, Test, DevOps** gibi alt görevlere böler.
*   **Yetenek ve Yük Analizi:** Ekip üyelerinin uzmanlık alanlarını (Skills), mevcut iş yüklerini (Current Load) ve kapasitelerini (Capacity) analiz eder.
*   **Smart Assignment & Gerekçelendirme:** Her alt görevi yapay zeka muhakemesiyle ekibin en uygun üyesine atar ve neden o kişinin atandığına dair somut teknik gerekçeler sunar.
*   **Markdown Raporu:** Kırılım raporunu tek tıkla kopyalanabilir markdown formatında oluşturur.

### 2. 📊 Agile Dashboard & Metrik Görselleştirme
*   **Canlı Metrik Takibi:** Kalan gün sayısı, sprint tamamlanma oranları, aktif görev sayıları, bloke görevler ve sprinte dışarıdan taşınan (carryover) işlerin oranlarını izler.
*   **Recharts Entegrasyonu:** Takım kapasite yüklerini, geçmiş sprint velocity trendlerini (Planned vs. Completed) dinamik ve şık grafiklerle sunar.
*   **Sprint Review Raporu:** Tek bir tuşla tüm sprinti analiz eden, ekibin başarılarını özetleyen, sprint sağlık skorunu (Health Score) hesaplayan ve bir sonraki sprint için stratejik öneriler üreten **AI Sprint Review** raporu oluşturur.

### 3. ⏱️ Story Point Tahminleme ve Risk Analizi (Predictive Sizing)
*   Takımın geçmiş sprintlerdeki **ortalama velocity (hız)** değerini temel alır.
*   Görevin başlık, açıklama, öncelik ve tipine göre yapay zekayla story point değerini ("XS, S, M, L, XL" t-shirt sizing parametreleriyle eşleştirerek) tahminler.
*   Tahminin doğruluk/güven düzeyini (**Düşük, Orta, Yüksek**) belirtir, teknik gerekçelerini sıralar ve olası riskleri ekibe önceden raporlar.

### 4. 🔗 Jira Entegrasyonu & Çevrimdışı / Güvenli Mod
*   **Gerçek Zamanlı Senkronizasyon:** `jira.turkcell.com.tr` üzerindeki aktif panolarla (Board) entegre çalışabilir. Sprintleri, backlog listesini ve ekip yüklerini otomatik çeker.
*   **Hata Toleranslı Altyapı (Resilient Fallback):** Jira bağlantısında SSL hataları, erişim engelleri veya token eksikliği yaşanması durumunda, sistem kesintiye uğramadan yerel in-memory veritabanına ve mock seed verilerine geçiş yapar. Bu sayede demo ve sunum ortamlarında asla yarı yolda kalmaz.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Backend (Geri Plan)
*   **Node.js & Express.js:** RESTful API hizmeti.
*   **OpenAI SDK (`gpt-4o`):** Yüksek kaliteli Agile asistanlığı ve JSON yapılandırılmış veri üretimi.
*   **HTTPS Node Agent:** Yetkilendirme sertifikalarını esnek yöneten güvenli entegrasyon altyapısı.
*   **In-Memory Database & Seed:** Veritabanı kurulumu gerektirmeden çalışan, hızlı prototipleme sağlayan veri katmanı.

### Frontend (Ön Plan)
*   **React.js (Vite):** Hızlı ve modern web arayüzü mimarisi.
*   **Tailwind CSS:** Slate/Dark temalı profesyonel ve modern arayüz tasarımı.
*   **Recharts:** Verileri anlamlı kılmak için geliştirilmiş interaktif grafik kütüphanesi.
*   **Axios:** Hata yakalama mekanizmalı API istemcisi.
*   **React Router Dom v6:** Sayfalar arası akıcı geçiş ve yönlendirme.

---

## 📁 Proje Yapısı

```text
apex/
├── backend/                  # Node.js API Sunucusu
│   ├── db/                   # In-memory veri deposu ve mock seed dosyaları
│   ├── routes/               # Express endpoint yönlendiricileri (AI, backlog, sprints, team)
│   ├── services/             # OpenAI (Claude modülü) ve Jira entegrasyon servisleri
│   ├── package.json          # Backend bağımlılıkları ve scriptleri
│   └── server.js             # Giriş noktası (Entry point)
│
├── frontend/                 # React Web Uygulaması
│   ├── src/
│   │   ├── components/       # Yeniden kullanılabilir UI bileşenleri (AI Paneli, Kartlar vb.)
│   │   ├── pages/            # Dashboard, Backlog ve Decompose sayfaları
│   │   ├── services/         # Axios API servis tanımları
│   │   ├── App.jsx           # Ana yönlendirici ve layout yapısı
│   │   └── main.jsx          # React giriş noktası
│   ├── package.json          # Frontend bağımlılıkları ve scriptleri
│   ├── tailwind.config.js    # Slate-Dark tema renkleri ve font yapılandırması
│   └── vite.config.js        # Paketleyici yapılandırması
```

---

## ⚙️ Kurulum ve Çalıştırma

Projenin yerel ortamda çalıştırılabilmesi için aşağıdaki adımları sırasıyla uygulayın.

### 1. Depoyu Klonlayın veya İndirin
Projeyi çalışma dizininize alın:
```bash
cd apex
```

### 2. Backend Kurulumu ve Çalıştırma

1. `backend` klasörüne geçiş yapın:
   ```bash
   cd backend
   ```
2. Gerekli paketleri kurun:
   ```bash
   npm install
   ```
3. Ortam değişkenlerini ayarlayın. `backend/.env` adında bir dosya oluşturun ve şu yapılandırmayı ekleyin (veya mevcut `.env.example` dosyasını referans alarak güncelleyin):
   ```ini
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key
   JIRA_BASE_URL=https://jira.turkcell.com.tr
   JIRA_TOKEN=your_jira_personal_access_token
   JIRA_BOARD_ID=23461
   ```
   *(Eğer Jira entegrasyonu kullanmayacaksanız, sistem otomatik olarak yerel mock verilere geçiş yapacak ve hatasız çalışacaktır. Ancak AI özellikleri için `OPENAI_API_KEY` tanımı şarttır).*

4. Backend uygulamasını başlatın:
   ```bash
   # Geliştirme (Watch) modu için:
   npm run dev

   # Normal çalıştırma için:
   node server.js
   ```
   Backend varsayılan olarak **http://localhost:3001** portu üzerinden yayına başlayacaktır.

---

### 3. Frontend Kurulumu ve Çalıştırma

1. `frontend` klasörüne geçiş yapın:
   ```bash
   cd ../frontend
   ```
2. Gerekli paketleri kurun:
   ```bash
   npm install
   ```
3. Arayüzü yerel sunucuda yayına alın:
   ```bash
   npm run dev
   ```
   Frontend varsayılan olarak **http://localhost:5173** (veya benzer bir Vite portu) üzerinden çalışacaktır. Tarayıcınızda açarak kullanmaya başlayabilirsiniz.

---

## 💡 Ekran ve Sayfa Detayları

*   **Pano (Dashboard):** Takımın güncel sprint performansını, kalan süresini, story point dağılımlarını ve iş yüklerini görsellerle değerlendirin. **AI Sprint Değerlendirmesi** ile retrospektif öncesi aksiyon maddesi hazırlayın.
*   **İş Listesi (Backlog):** Jira'dan veya yerel listeden işleri inceleyin. AI asistanının her task için t-shirt boyutlandırmasına göre story point tahmini yapmasını sağlayın. Blokajlı görevleri seçip anında **Blokaj Çözüm Kılavuzu** edinin.
*   **Görev Bölme (Decompose):** Büyük projeleri ve taskları alt görevlere bölmek için bir görevi seçin. Listelenen akıllı kırılım ve ekip atama verilerini doğrudan jira/wiki ortamına aktarmak için Markdown olarak kopyalayın.

---

## 🛡️ Güvenlik ve Uyarlanabilirlik

*   Kurumsal ağlarda Jira erişimi sırasında karşılaşılan SSL/TLS el sıkışması engellerini aşmak üzere HTTPS katmanı esnek tutulmuş ve `rejectUnauthorized: false` ile konfigüre edilmiştir.
*   API anahtarları ve Jira jetonları doğrudan güvenli ortam değişkenlerinde saklanır, istemci tarafına (Frontend) asla sızdırılmaz.
*   Hata tolerans yaklaşımı sayesinde, API sorgularında oluşabilecek herhangi bir zaman aşımı veya erişim engeli doğrudan son kullanıcı dostu arayüze hata yansıtmak yerine, akıllı default modeller (fallback) üzerinden beslenir.

---

*APEX ekibi olarak iyi kodlamalar ve verimli sprintler dileriz! 🚀*

