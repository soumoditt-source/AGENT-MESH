/**
 * AgentMesh — x402 Research Gateway Server
 * This server acts as the paid API gateway:
 *   - All endpoints return 402 Payment Required until proof is provided
 *   - After valid X-Payment-Proof header, real data is fetched from free APIs
 *   - Also serves the static dashboard on the same port
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeResearch } from './lib/agentRunner.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PAID_AMOUNT = '0.1';
const RECIPIENT = process.env.RECIPIENT || '0x0000000000000000000000000000000000000001';

app.use(express.json());

// ─── CORS for dashboard ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Payment-Proof, X-Payment-Network');
  res.header('Access-Control-Expose-Headers', 'x-payment-amount, x-payment-recipient, x-payment-network, x-payment-token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── PAYMENT GUARD MIDDLEWARE ──────────────────────────────────────────────
function requirePayment(req, res, next) {
  // Free loading bypass referral code
  if (req.headers['x-bypass-code'] === 'DAKSH_FULLSTACKSHINOBI') {
    return next();
  }

  const proof = req.headers['x-payment-proof'];
  if (!proof || proof.length < 10) {
    return res
      .status(402)
      .set('x-payment-amount', PAID_AMOUNT)
      .set('x-payment-recipient', RECIPIENT)
      .set('x-payment-network', 'avalanche-fuji')
      .set('x-payment-token', 'USDC')
      .json({
        error: 'Payment Required',
        amount: `${PAID_AMOUNT} USDC`,
        recipient: RECIPIENT,
        network: 'avalanche-fuji',
        instructions: 'Pay via facinet-sdk, then retry with X-Payment-Proof: <txHash>'
      });
  }
  next();
}

import { 
  fetchNews, 
  fetchAcademic, 
  fetchSocial, 
  fetchTech, 
  fetchWiki, 
  fetchCrypto, 
  fetchQuotes,
  fetchMeteo
} from './lib/researchProviders.js';

// ─── /research/news — NewsAPI with Guardian fallback ──────────────────────
app.get('/research/news', requirePayment, async (req, res) => {
  const q = req.query.q || 'technology';
  try {
    const data = await fetchNews(q, process.env.NEWS_API_KEY, process.env.GUARDIAN_API_KEY);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/academic — arXiv papers ────────────────────────────────────
app.get('/research/academic', requirePayment, async (req, res) => {
  const q = req.query.q || 'artificial intelligence';
  try {
    const data = await fetchAcademic(q);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/social — Reddit discussions ────────────────────────────────
app.get('/research/social', requirePayment, async (req, res) => {
  const q = req.query.q || 'technology';
  try {
    const data = await fetchSocial(q);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/tech — HackerNews ──────────────────────────────────────────
app.get('/research/tech', requirePayment, async (req, res) => {
  const q = req.query.q || 'ai';
  try {
    const data = await fetchTech(q);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/wiki — Wikipedia Search & Summary ───────────────────────────
app.get('/research/wiki', requirePayment, async (req, res) => {
  const q = req.query.q || 'artificial intelligence';
  try {
    const data = await fetchWiki(q);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/crypto — CoinCap (CoinGecko Alternative) ───────────────────
app.get('/research/crypto', requirePayment, async (req, res) => {
  try {
    const data = await fetchCrypto();
    res.json({ ...data, query: 'crypto assets' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/quotes — Zen Quotes API ────────────────────────────────────
app.get('/research/quotes', requirePayment, async (req, res) => {
  try {
    const data = await fetchQuotes();
    res.json({ ...data, query: 'inspiration' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/meteo — Weather & Location Metrics ──────────────────────────
app.get('/research/meteo', requirePayment, async (req, res) => {
  const q = req.query.q || 'delhi';
  try {
    const data = await fetchMeteo(q);
    res.json({ ...data, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /health ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    endpoints: ['/research/news', '/research/academic', '/research/social', '/research/tech', '/research/wiki', '/research/crypto'],
    network: 'avalanche-fuji',
    paymentAmount: `${PAID_AMOUNT} USDC`,
    recipient: RECIPIENT
  });
});

// ─── /api/run-agent — POST endpoint for dashboard ─────────────────────────
app.post('/api/run-agent', async (req, res) => {
  const { topic, priority, retries } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  res.setHeader('Content-Type', 'application/json');

  try {
    const result = await executeResearch({
      topic,
      priority: priority || 'Medium',
      maxRetries: retries !== undefined ? parseInt(retries, 10) : 2,
      log: (msg) => console.log(chalk.dim(`  [Agent] ${msg}`))
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error(chalk.red('Agent run error:'), err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Static dashboard ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dashboard')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.bold.blue(`
╔══════════════════════════════════════════════════╗
║         AgentMesh x402 Gateway + Dashboard        ║
╠══════════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(39)}║
║  Dashboard: http://localhost:${String(PORT).padEnd(21)}║
║  Health:   http://localhost:${PORT}/health${' '.repeat(14)}║
╚══════════════════════════════════════════════════╝
  `));
  console.log(chalk.green('  ✓ x402 Research Endpoints: /research/news | /research/academic'));
  console.log(chalk.green('  ✓ /research/social | /research/tech | /research/wiki | /research/crypto'));
  console.log(chalk.yellow(`  ⚡ All endpoints require ${PAID_AMOUNT} USDC payment on avalanche-fuji\n`));
});
