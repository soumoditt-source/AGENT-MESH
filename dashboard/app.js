/**
 * AgentMesh Dashboard — app.js
 * Live HUD controller: talks to /api/run-agent, updates UI in real-time
 */

// ── STATE ──────────────────────────────────────────────────────────────────
let agentRunning = false;
let txCount = 0;
let lastReport = null;
let reportTopic = '';
const API_BASE = window.location.origin;

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
  checkServerHealth();
  setInterval(checkServerHealth, 10000);

  // Enter key support
  document.getElementById('topicInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !agentRunning) launchAgent();
  });
});

function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('currentTime').textContent = t;
}

async function checkServerHealth() {
  const dot   = document.getElementById('serverDot');
  const label = document.getElementById('serverLabel');
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      dot.className = 'dot green pulse';
      label.textContent = 'GATEWAY ONLINE';
    } else {
      dot.className = 'dot red';
      label.textContent = 'GATEWAY ERROR';
    }
  } catch {
    dot.className = 'dot red pulse';
    label.textContent = 'GATEWAY OFFLINE';
  }
}

// ── AGENT LAUNCH ───────────────────────────────────────────────────────────
async function launchAgent() {
  const topic = document.getElementById('topicInput').value.trim();
  if (!topic) {
    shakeInput();
    return;
  }
  if (agentRunning) return;

  agentRunning = true;
  reportTopic  = topic;
  txCount      = 0;

  const priority = document.getElementById('prioritySelect').value;
  const retries  = parseInt(document.getElementById('retriesSelect').value);

  // Reset UI
  resetSubAgents();
  clearLog();
  clearReport();
  clearTxFeed();
  resetFlowSteps();
  resetStats();

  document.getElementById('launchBtn').disabled = true;
  document.getElementById('launchBtn').querySelector('.btn-text').textContent = 'AGENT RUNNING…';

  showLoading('INITIALIZING AGENT MESH');

  // Simulate real-time progress (since we can't stream from the backend easily)
  simulateProgress(topic, priority, retries);

  // Actual API call
  try {
    log('info', 'INIT', `Launching AgentMesh for topic: "${topic}"`);
    log('info', 'NET', `Connecting to Avalanche Fuji Testnet (Chain 43113)…`);
    log('sys', 'SDK', 'Initializing facinet-sdk with PRIVATE_KEY…');

    activateFlowStep(1);

    const res = await fetch(`${API_BASE}/api/run-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, priority, retries })
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }

    hideLoading();
    onAgentComplete(json.result, topic);

  } catch (err) {
    hideLoading();
    log('err', 'ERR', `Agent failed: ${err.message}`);
    log('sys', 'INFO', 'Check: PRIVATE_KEY, GEMINI_API_KEY, RECIPIENT in .env — then restart server');
    setFooterStatus('error', 'AGENT ERROR');
  } finally {
    agentRunning = false;
    document.getElementById('launchBtn').disabled = false;
    document.getElementById('launchBtn').querySelector('.btn-text').textContent = 'LAUNCH AGENT MESH';
    stopSimulation();
  }
}

function shakeInput() {
  const input = document.getElementById('topicInput');
  input.style.animation = 'none';
  setTimeout(() => {
    input.style.animation = 'shake 0.4s ease-out';
  }, 10);
}

// ── RESULT HANDLER ─────────────────────────────────────────────────────────
function onAgentComplete(result, topic) {
  lastReport = result;

  // Final log messages
  log('ok', 'DONE', `Research complete! ${result.payments} payment(s) made.`);

  if (result.registryTx) {
    log('ok', 'ERC-8004', `Agent registered on-chain: ${result.registryTx.slice(0, 20)}…`);
    addTxCard('REGISTRY', result.registryTx);
  }

  // Add all payment TX cards
  if (result.paymentList?.length > 0) {
    result.paymentList.forEach(p => {
      if (p.txHash && !document.querySelector(`[data-tx="${p.txHash}"]`)) {
        addTxCard(p.source || 'API', p.txHash);
      }
    });
  }

  // Mark all sub-agents done
  for (let i = 0; i < 3; i++) {
    markSubAgent(i, 'done', result.queries?.[i] || '—', '✓ DONE');
  }

  // Flow steps
  activateFlowStep(5);
  markFlowDone();

  // Stats
  document.getElementById('statPayments').textContent = result.payments || 0;
  document.getElementById('statUSDC').textContent = `$${((result.payments || 0) * 0.1).toFixed(1)}`;
  document.getElementById('statSources').textContent = result.sources?.length || 0;
  document.getElementById('statTime').textContent = result.elapsed ? result.elapsed + 's' : '—';

  // Render report
  renderReport(result, topic);

  setFooterStatus('ok', 'RESEARCH COMPLETE');
}

// ── REPORT RENDERER ────────────────────────────────────────────────────────
function renderReport(result, topic) {
  const meta     = document.getElementById('reportMeta');
  const actions  = document.getElementById('reportActions');
  const content  = document.getElementById('reportContent');

  document.getElementById('metaTopic').textContent   = topic;
  document.getElementById('metaDate').textContent    = new Date().toLocaleString();
  document.getElementById('metaSources').textContent = result.sources?.join(', ') || '—';
  document.getElementById('metaOnChain').textContent =
    result.paymentList?.length > 0
      ? `${result.paymentList.length} payment tx${result.registryTx ? ' + 1 registry tx' : ''}`
      : '—';

  meta.style.display    = 'flex';
  actions.style.display = 'flex';

  // Convert markdown to HTML (basic renderer)
  const html = markdownToHtml(result.report || '');
  content.innerHTML = `<div class="report-md">${html}</div>`;
}

function markdownToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="color:#00b4ff;font-family:var(--mono)">$1</code>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .split('\n').filter(Boolean).map(line =>
      (line.startsWith('<') ? line : `<p>${line}</p>`)
    ).join('');
}

function downloadReport() {
  if (!lastReport) return;
  const blob = new Blob([lastReport.fullReport || lastReport.report || ''], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `agentmesh_report_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyReport() {
  if (!lastReport) return;
  navigator.clipboard.writeText(lastReport.fullReport || lastReport.report || '');
  const btn = document.querySelector('.action-btn');
  btn.textContent = '✓ COPIED';
  setTimeout(() => btn.textContent = '⎘ COPY', 2000);
}

// ── SIMULATION (progress animation while API runs) ─────────────────────────
let simTimers = [];

function simulateProgress(topic, priority, retries) {
  const ENDPOINTS   = ['NEWS', 'ACADEMIC', 'SOCIAL'];
  const FAKE_QUERIES = [`${topic} latest`, `${topic} research`, `${topic} analysis`];

  // Step 2: gemini
  simTimers.push(setTimeout(() => {
    hideLoading();
    showLoading('GENERATING SUB-QUERIES WITH GEMINI');
    log('info', 'LLM', 'Calling Gemini 1.5 Flash — generating 3 targeted sub-queries…');
    activateFlowStep(2);
  }, 1200));

  // Sub-agents start
  ENDPOINTS.forEach((ep, i) => {
    simTimers.push(setTimeout(() => {
      hideLoading();
      showLoading(`SUB-AGENT ${i+1}: DETECTING x402 GATE`);
      markSubAgent(i, 'active', FAKE_QUERIES[i], 'FETCHING');
      log('info', `SA-${i+1}`, `Sub-Agent ${i+1} fetching /research/${ep.toLowerCase()} — query: "${FAKE_QUERIES[i]}"`);
      activateFlowStep(3);

      // Payment
      simTimers.push(setTimeout(() => {
        showLoading(`SUB-AGENT ${i+1}: PAYING VIA FACINET`);
        markSubAgent(i, 'paying', FAKE_QUERIES[i], 'PAYING');
        log('pay', 'x402', `⚡ HTTP 402 detected → calling facinet.pay(0.1 USDC) on Avalanche Fuji…`);
        activateFlowStep(4);
      }, 1000));
    }, 3000 + i * 3500));
  });
}

function stopSimulation() {
  simTimers.forEach(clearTimeout);
  simTimers = [];
}

// ── UI HELPERS ─────────────────────────────────────────────────────────────
function log(type, tag, msg) {
  const div = document.getElementById('terminalLog');
  const t   = new Date().toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.innerHTML = `
    <span class="log-time">${t}</span>
    <span class="log-tag">[${tag}]</span>
    <span>${escHtml(msg)}</span>
  `;
  div.appendChild(line);
  div.scrollTop = div.scrollHeight;
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function clearLog() {
  document.getElementById('terminalLog').innerHTML = '';
}

function clearReport() {
  document.getElementById('reportMeta').style.display    = 'none';
  document.getElementById('reportActions').style.display = 'none';
  document.getElementById('reportContent').innerHTML = `
    <div class="report-placeholder">
      <div class="placeholder-icon">◈</div>
      <div class="placeholder-text">Running research agent…</div>
      <div class="placeholder-sub">Results will appear here shortly</div>
    </div>`;
}

function clearTxFeed() {
  txCount = 0;
  document.getElementById('txCount').textContent = '0 txs';
  document.getElementById('txFeed').innerHTML = '<div class="tx-empty">Waiting for transactions…</div>';
}

function clearTerminal() {
  clearLog();
  log('sys', 'CLR', 'Terminal cleared.');
}

function addTxCard(source, txHash) {
  const feed  = document.getElementById('txFeed');
  const empty = feed.querySelector('.tx-empty');
  if (empty) empty.remove();

  txCount++;
  document.getElementById('txCount').textContent = `${txCount} tx${txCount !== 1 ? 's' : ''}`;

  const card = document.createElement('div');
  card.className = 'tx-card';
  card.dataset.tx = txHash;
  card.innerHTML = `
    <span class="tx-source">${escHtml(source)}</span>
    <span class="tx-hash">${txHash.slice(0,10)}…${txHash.slice(-6)}</span>
    <a class="tx-link" href="https://testnet.snowtrace.io/tx/${encodeURIComponent(txHash)}" target="_blank" rel="noopener">SNOWTRACE ↗</a>
  `;
  feed.appendChild(card);
  feed.scrollTop = feed.scrollHeight;

  log('ok', 'TX', `Payment confirmed → ${txHash.slice(0,14)}… — snowtrace.io ↗`);
}

function markSubAgent(idx, status, query, statusLabel) {
  const row = document.getElementById(`sa-${idx}`);
  if (!row) return;
  row.className = `sa-row ${status}`;
  row.querySelector('.sa-query').textContent  = query;
  row.querySelector('.sa-status').textContent = statusLabel;
}

function resetSubAgents() {
  for (let i = 0; i < 3; i++) {
    markSubAgent(i, '', '—', 'IDLE');
    document.getElementById(`sa-${i}`).className = 'sa-row';
  }
}

function resetFlowSteps() {
  document.querySelectorAll('.flow-step').forEach(s => {
    s.classList.remove('active','done');
  });
  document.querySelector('[data-step="1"]').classList.add('active');
}

function activateFlowStep(n) {
  document.querySelectorAll('.flow-step').forEach((s, i) => {
    if (i < n - 1) s.classList.add('done');
    else if (i === n - 1) s.classList.add('active');
    else { s.classList.remove('active','done'); }
  });
}

function markFlowDone() {
  document.querySelectorAll('.flow-step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('done');
  });
}

function resetStats() {
  document.getElementById('statPayments').textContent = '0';
  document.getElementById('statUSDC').textContent     = '$0.00';
  document.getElementById('statSources').textContent  = '0';
  document.getElementById('statTime').textContent     = '—';
}

function showLoading(text) {
  document.getElementById('loadingText').textContent = text || 'PROCESSING';
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function setFooterStatus(type, msg) {
  const el  = document.getElementById('footerStatus');
  const dot = el.querySelector('.dot') || document.createElement('span');
  dot.className = type === 'ok' ? 'dot green pulse' : type === 'error' ? 'dot red pulse' : 'dot pulse';
  el.innerHTML = '';
  el.appendChild(dot);
  const text = document.createElement('span');
  text.textContent = msg;
  el.appendChild(text);
}
