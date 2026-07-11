// ═══════════════════════════════════════════════════════════════════
// HVAC Pro v8 — Groq Proxy Server
// Çalıştır: node server.js   (veya start.bat)
// Port: 3001  |  Groq key: .env dosyasına yaz
// ═══════════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3001;

const GROQ_KEY   = process.env.GROQ_API_KEY || '';
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL      = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (!GROQ_KEY) {
  console.warn('\n⚠  GROQ_API_KEY bulunamadı!');
  console.warn('   .env dosyasına şunu ekleyin:');
  console.warn('   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx\n');
}

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));
// Geliştirme sırasında JS dosyalarının tarayıcı önbelleğinde takılı kalmasını
// (eski hesap mantığının çalışmaya devam etmesini) önlemek için önbellek kapatıldı.
app.use(express.static('.', {
  etag: false,
  lastModified: false,
  cacheControl: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));   // index.html'i de serve et

// ── Sağlık kontrolü ──────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    ok: !!GROQ_KEY,
    model: MODEL,
    keyConfigured: !!GROQ_KEY,
    keyPrefix: GROQ_KEY ? GROQ_KEY.slice(0, 8) + '...' : null
  });
});

// ── Groq proxy endpoint ───────────────────────────────────────────
app.post('/api/groq', async (req, res) => {
  if (!GROQ_KEY) {
    return res.status(503).json({
      error: { message: 'Sunucu yapılandırılmamış. .env dosyasına GROQ_API_KEY ekleyin.' }
    });
  }

  const body = JSON.stringify({
    model:       req.body.model       || MODEL,
    messages:    req.body.messages    || [],
    temperature: req.body.temperature ?? 0.2,
    max_tokens:  req.body.max_tokens  ?? 2048,
  });

  const options = {
    hostname: 'api.groq.com',
    path:     '/openai/v1/chat/completions',
    method:   'POST',
    headers:  {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const proxy = https.request(options, groqRes => {
    res.status(groqRes.statusCode);
    // Forward rate-limit headers
    ['x-ratelimit-limit-requests','x-ratelimit-remaining-requests',
     'x-ratelimit-reset-requests','retry-after'].forEach(h => {
      if (groqRes.headers[h]) res.setHeader(h, groqRes.headers[h]);
    });
    res.setHeader('Content-Type', 'application/json');
    groqRes.pipe(res);
  });

  proxy.on('error', err => {
    console.error('Groq proxy hatası:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: { message: 'Groq bağlantı hatası: ' + err.message } });
    }
  });

  proxy.write(body);
  proxy.end();
});

// ── Başlat ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log(`║  HVAC Pro v8 — Groq Proxy Sunucusu          ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Adres  : http://localhost:${PORT}              ║`);
  console.log(`║  Model  : ${MODEL.padEnd(34)}║`);
  console.log(`║  Key    : ${GROQ_KEY ? '✅ Yapılandırıldı'.padEnd(34) : '❌ EKSİK (.env ekleyin)'.padEnd(34)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  if (GROQ_KEY) {
    console.log('\n  Tarayıcıda açın: http://localhost:' + PORT + '\n');
  }
});
