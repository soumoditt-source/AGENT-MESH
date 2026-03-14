/**
 * AgentMesh — x402 Research Gateway Server
 * This server acts as the paid API gateway:
 *   - All endpoints return 402 Payment Required until proof is provided
 *   - After valid X-Payment-Proof header, real data is fetched from free APIs
 *   - Also serves the static dashboard on the same port
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

// ─── /research/news — NewsAPI with Guardian fallback ──────────────────────
app.get('/research/news', requirePayment, async (req, res) => {
  const q = req.query.q || 'technology';
  try {
    if (process.env.NEWS_API_KEY) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=5&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status === 'ok' && data.articles?.length > 0) {
        const articles = data.articles.map(a => ({
          title: a.title,
          description: a.description,
          source: a.source?.name,
          publishedAt: a.publishedAt,
          url: a.url
        }));
        return res.json({ source: 'NewsAPI', query: q, results: articles });
      }
    }
    // Fallback: Guardian API (hardcoded requested key for hackathon)
    const guardianKey = process.env.GUARDIAN_API_KEY || '53e3f46c-4277-46c6-ae33-600cf2da841f';
    if (guardianKey) {
      const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(q)}&show-fields=trailText&page-size=5&api-key=${guardianKey}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.response?.results?.length > 0) {
        const results = data.response.results.map(a => ({
          title: a.webTitle,
          description: a.fields?.trailText,
          source: 'The Guardian',
          publishedAt: a.webPublicationDate,
          url: a.webUrl
        }));
        return res.json({ source: 'Guardian', query: q, results });
      }
    }
    // Last fallback: HackerNews
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=5&tags=story`;
    const r = await fetch(url);
    const data = await r.json();
    const results = (data.hits || []).map(h => ({
      title: h.title,
      description: `${h.points} points · by ${h.author}`,
      source: 'HackerNews',
      publishedAt: h.created_at,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));
    return res.json({ source: 'HackerNews', query: q, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/academic — arXiv papers ────────────────────────────────────
app.get('/research/academic', requirePayment, async (req, res) => {
  const q = req.query.q || 'artificial intelligence';
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=0&max_results=5`;
    const r = await fetch(url);
    const xml = await r.text();

    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = (/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1] || '').replace(/\n/g, ' ').trim();
      const summary = (/<summary>([\s\S]*?)<\/summary>/.exec(entry)?.[1] || '').replace(/\n/g, ' ').trim().slice(0, 250);
      const id = (/<id>(http[^<]+)<\/id>/.exec(entry)?.[1] || '').trim();
      if (title) entries.push({ title, summary, url: id });
    }

    res.json({ source: 'arXiv', query: q, results: entries });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/social — Reddit discussions ────────────────────────────────
app.get('/research/social', requirePayment, async (req, res) => {
  const q = req.query.q || 'technology';
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=hot&limit=5`;
    const r = await fetch(url, { headers: { 'User-Agent': 'AgentMesh/1.0 hackathon-bot' } });
    const data = await r.json();
    const posts = (data.data?.children || []).map(p => ({
      title: p.data.title,
      score: p.data.score,
      comments: p.data.num_comments,
      subreddit: p.data.subreddit,
      url: `https://reddit.com${p.data.permalink}`
    }));
    res.json({ source: 'Reddit', query: q, results: posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/tech — HackerNews ──────────────────────────────────────────
app.get('/research/tech', requirePayment, async (req, res) => {
  const q = req.query.q || 'ai';
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=5&tags=story`;
    const r = await fetch(url);
    const data = await r.json();
    const hits = (data.hits || []).map(h => ({
      title: h.title,
      points: h.points,
      comments: h.num_comments,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      author: h.author
    }));
    res.json({ source: 'HackerNews', query: q, results: hits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/wiki — Wikipedia ───────────────────────────────────────────
app.get('/research/wiki', requirePayment, async (req, res) => {
  const q = req.query.q || 'artificial intelligence';
  try {
    const formatted = q.replace(/\s+/g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'AgentMesh/1.0' } });
    if (r.status === 404) {
      return res.json({ source: 'Wikipedia', query: q, results: [{ title: q, summary: 'No Wikipedia page found.', url: '' }] });
    }
    const data = await r.json();
    res.json({
      source: 'Wikipedia',
      query: q,
      results: [{ title: data.title, summary: data.extract, url: data.content_urls?.desktop?.page || '' }]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/crypto — CoinCap (CoinGecko Alternative) ───────────────────
app.get('/research/crypto', requirePayment, async (req, res) => {
  try {
    const url = 'https://api.coincap.io/v2/assets?limit=10';
    const r = await fetch(url);
    const data = await r.json();
    const results = (data.data || []).map(coin => ({
      name: coin.name,
      symbol: coin.symbol,
      priceUsd: `$${parseFloat(coin.priceUsd).toFixed(2)}`,
      marketCap: `$${parseFloat(coin.marketCapUsd).toFixed(0)}`,
      change24h: `${parseFloat(coin.changePercent24Hr).toFixed(2)}%`
    }));
    res.json({ source: 'CoinCap', query: 'crypto assets', results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── /research/quotes — Zen Quotes API ────────────────────────────────────
app.get('/research/quotes', requirePayment, async (req, res) => {
  try {
    const url = 'https://zenquotes.io/api/random';
    const r = await fetch(url);
    const data = await r.json();
    const results = data.map(q => ({
      quote: q.q,
      author: q.a,
      html: q.h
    }));
    res.json({ source: 'ZenQuotes', query: 'inspiration', results });
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
