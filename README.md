<div align="center">
  <img src="https://media.giphy.com/media/xTiTnzg2zE6q9vJ1io/giphy.gif" alt="AgentMesh Arc Reactor" width="100%" style="border-radius: 12px; border: 2px solid #00e5ff; box-shadow: 0 0 20px rgba(0,229,255,0.4);" />
  
  <h1 style="color: #00e5ff; font-family: monospace; font-size: 3em; margin-bottom: 0;">⚡ AgentMesh ⚡</h1>
  <p style="font-size: 1.2em; color: #a0aec0; letter-spacing: 2px;">THE AUTONOMOUS x402 RESEARCH NETWORK</p>
  
  <p style="margin-top: 10px;">
    <a href="https://agent-mesh-seven.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white&labelColor=00e5ff" alt="Live Demo" />
    </a>
  </p>

  <p>
    <b>Vibe-A-Thon @ Daksh 2026 · Heritage Campus</b><br/>
    <i>Built by Team <b>FULLSTACK SHINOBI</b></i>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Blockchain-Avalanche%20Fuji-red?style=for-the-badge&logo=avalanche" />
    <img src="https://img.shields.io/badge/Payment-x402%20Protocol-00e5ff?style=for-the-badge" />
    <img src="https://img.shields.io/badge/AI-Gemini%201.5%20Flash-orange?style=for-the-badge&logo=google" />
    <img src="https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js" />
  </p>
</div>

---

## 🦸‍♂️ The Marvel Avatar: Iron Man's Arc Reactor

In a world where AI agents are blind and broke, **AgentMesh is Tony Stark**. 
It doesn't just read the internet—it **earns, spends, and transacts entirely on its own**. 

The core of AgentMesh is its **x402 Payment Engine* (The Arc Reactor). When an AI hits a premium API paywall (`HTTP 402 Payment Required`), AgentMesh doesn't crash. It seamlessly fires a gasless USDC transaction via the `facinet` SDK on Avalanche Fuji, generates a cryptographic payment proof, and unlocks the data. 

*No humans. No credit cards. Pure autonomous finance.*

---

## 🚀 The x402 Architecture Masterpiece

AgentMesh operates on a state-of-the-art multi-agent orchestration pattern integrated intimately with HTTP 402 payment rails.

<br>
<div align="center">
  <img src="https://media.giphy.com/media/26tn33aiTi1jIGs4E/giphy.gif" alt="Data Flow" width="80%" style="border-radius: 8px; border: 1px solid #333;" />
</div>
<br>

### How it Flows:
1. **The Catalyst (User Query):** You request deep-dive intelligence (e.g., "Future of Agentic AI 2026").
2. **The Orchestrator (Multi-LLM):** The Master Agent breaks your request into 3 sub-queries using **Gemini 3.1 Pro** (High Reasoning). If Gemini is down, it automatically fails over to **OpenRouter** or **Hugging Face**.
3. **The x402 Paywalls (Sub-Agents):** 
   - Agents hit premium endpoints (`/research/news`, `/research/crypto`, etc.).
   - The Gateway responds: `402 Payment Required`.
4. **The Arc Reactor (Auto-Payment):**
   - AgentMesh automatically signs an ERC-3009 gasless transaction.
   - It pays `0.1 USDC` to the API facilitator on Avalanche Fuji.
   - It retries the request with an `X-Payment-Proof` header representing the confirmed `txHash`.
   - *Demo Bypass:* Alternatively uses standard `X-Bypass-Code: DAKSH_FULLSTACKSHINOBI` for free verification.
5. **The Synthesis:** Data is ingested, collated, and synthesized into a master intelligence report with a multi-layered failover chain ensuring 100% uptime.
6. **The Chronicle (ERC-8004):** The agent registers its creation and existence on the blockchain via `AgentRegistry.sol`.

---

## 📡 Premium x402 Integrated Endpoints

Our gateway is wired to real-world data streams, all protected by the x402 protocol:

| Endpoint | Intelligence Source | Paywall State |
|----------|---------------------|---------------|
| `GET /research/news` | NewsAPI & Guardian API | **Active 402** |
| `GET /research/crypto` | CoinCap Live Market Data | **Active 402** |
| `GET /research/quotes` | ZenQuotes Tech Analytics | **Active 402** |
| `GET /research/academic` | arXiv Papers | Free Tier |
| `GET /research/tech` | HackerNews Algolia | Free Tier |

---

## 💻 Tech Stack: The Fullstack Shinobi Arsenal

- **Frontend HUD:** Next.js 15, React 19, Tailwind CSS v4, custom Arc-Reactor Glow UI.
- **Backend Core:** Node.js API Gateway, Next.js Serverless Functions.
- **Web3 / Crypto:** `ethers.js` v6, `facinet` SDK, Avalanche Fuji Testnet.
- **Smart Contracts:** Solidity, Hardhat, ERC-8004 Agent Registry.
- **AI Brain:** Google Gemini 1.5 Flash.

---

## ⚡ Deployment & Local Setup

### Run it Locally
```bash
# 1. Clone the repo
git clone https://github.com/soumoditt-source/AGENT-MESH.git
cd AGENT-MESH

# 2. Install dependencies
npm install

# 3. Setup Variables (.env)
# PRIVATE_KEY=your_key
# RECIPIENT=wallet_address
# GEMINI_API_KEY=your_key

# 4. Boot the Arc Reactor
npm run dev
```
Navigate to `http://localhost:3000` to access the Command Center. Use referral code `DAKSH_FULLSTACKSHINOBI` to bypass live payments during demonstrations.

---

<div align="center">
  <img src="https://media.giphy.com/media/l0Iyl55kTeh71nTXy/giphy.gif" alt="Victory" width="100%" style="border-radius: 12px; opacity: 0.8;" />
  <br><br>
  <h3>Team FULLSTACK SHINOBI</h3>
  <p><b>Leader:</b> SOUMODITYA DAS | <b>Advisor:</b> SOUNAK KUMAR MONDAL | <b>Presenter:</b> RAJASHRI CHAUDHURI</p>
  <i>"We didn't just build an app. We built an autonomous digital citizen."</i>
</div>
