# AgentMesh — Autonomous x402 Research Network

> **Vibe-A-Thon @ Daksh 2026 · Heritage Campus**

AgentMesh is the first autonomous AI agent that **earns and spends USDC independently**. It takes any research topic, deploys sub-agents that hit real paid API gateways behind HTTP 402 gates, makes gasless USDC payments on Avalanche Fuji via SDK, synthesizes real intelligence using Gemini AI, and self-registers its identity on the ERC-8004 on-chain agent registry.

## ■ THE WINNING PROJECT: AgentMesh
**AgentMesh: The Autonomous x402 Research Network**

### ■ YOUR PROJECT'S MARVEL AVATAR
| Character | Why They Fit | Object They Hold |
| :--- | :--- | :--- |
| **Iron Man (Tony Stark)** | Autonomous AI agent + tech genius. Builds systems that work independently, pays bills and runs networks solo. | **Arc Reactor** = x402 payment engine powering everything |
| **Doctor Strange** | Controls multiple realities/networks, orchestrates agent mesh across chains, sees all possible outcomes (LLM). | **Eye of Agamotto** = multi-chain USDC payment oracle |
| **Spider-Man 2099** | Future web-slinger — web of agents. Connects nodes across networks, rapid deployment, futuristic build. | **Web-shooters** = facinet SDK firing gasless transactions |

★ **WINNER PICK:** Iron Man holding the Arc Reactor = x402 payment engine powering everything.

---

## 🏆 Team: FULLSTACK SHINOBI
- **Leader:** SOUMODITYA DAS
- **Advisor:** SOUNAK KUMAR MONDAL
- **Presenter:** RAJASHRI CHAUDHURI

---

## 🏗 Architecture

```
USER QUERY
    │
    ▼
MASTER AGENT (agentRunner.js)
    │  Gemini LLM → targeted sub-queries
    │
    ├─► SUB-AGENT 1 → GET /research/news
    │       → 402 Payment Required detected
    │       → X402 Payment / Referral Bypass (DAKSH_FULLSTACKSHINOBI)
    │       → Real data from NewsAPI / Guardian API
    │
    ├─► SUB-AGENT 2 → GET /research/crypto
    │       → 402 → pay/bypass → CoinCap Market Data
    │
    ├─► SUB-AGENT 3 → GET /research/quotes
    │       → 402 → pay/bypass → ZenQuotes API
    │
    ▼
SYNTHESIS (Gemini AI → structured report)
    │
    ▼
ERC-8004 SELF-REGISTRATION (Contract → AgentRegistry.sol)
    │
    ▼
OUTPUT: Report + Payment Proofs + Registry txHash (all in Dashboard)
```

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/soumoditt-source/AGENT-MESH.git
cd AGENT-MESH
npm install

# 2. Configure environment
cp .env.example .env
# Fill in: PRIVATE_KEY, RECIPIENT, GEMINI_API_KEY, NEWS_API_KEY

# 3. Start Next.js Frontend
npm run dev

# 4. Start x402 Gateway (in a separate terminal)
node server.js
```

Then open `http://localhost:3000` to interact with the premium Next.js dashboard!

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ | MetaMask wallet private key (hex) |
| `RECIPIENT` | ✅ | Wallet address receiving USDC payments |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NEWS_API_KEY` | Optional | newsapi.org free key (500 req/day) |
| `GUARDIAN_API_KEY` | Optional | Guardian Open Platform (Fallback provided natively) |
| `REGISTRY_ADDRESS` | After deploy | AgentRegistry.sol address on Fuji |
| `PORT` | Optional | NextJS Port (default: 3000) |
| `API_PORT` | Optional | Express Gateway Port (default: 3001) |

---

## 📡 x402 API Endpoints

All endpoints require HTTP 402 payment (or the `DAKSH_FULLSTACKSHINOBI` bypass code header) before returning data:

| Endpoint | Data Source |
|----------|-------------|
| `GET /research/news` | NewsAPI + Guardian API Fallback |
| `GET /research/academic` | arXiv papers |
| `GET /research/social` | Reddit public JSON |
| `GET /research/tech` | HackerNews Algolia |
| `GET /research/wiki` | Wikipedia REST API |
| `GET /research/crypto` | CoinCap API |
| `GET /research/quotes` | ZenQuotes API |

**x402 Bypass flow:**
```
Client Request: 
GET /research/news?q=AI+regulation
Headers: { "X-Bypass-Code": "DAKSH_FULLSTACKSHINOBI" }
Result: 200 OK + Real Data (No 402 Payment Required!)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Radix UI |
| Agent Payments | Node.js, Express, `ethers.js` v6, ERC-3009 gasless USDC |
| Blockchain | Avalanche Fuji Testnet (Chain ID 43113) |
| AI / LLM | Google Gemini 1.5 Flash |
| Data Sources | Guardian, CoinCap, ZenQuotes, NewsAPI, arXiv, Reddit, HackerNews, Wikipedia |
| Contract Tools | Hardhat + @nomicfoundation/hardhat-toolbox |

---

## 🏆 Why AgentMesh Wins

| Feature | AgentMesh | Existing Tools |
|---------|-----------|----------------|
| End-to-End Vibe | ✅ Astonishing UI/UX | ❌ Clunky CLI / Streamlit |
| Multi-agent APIs | ✅ Orchestrates real APIs simultaneously | ❌ Fake dummy data |
| ERC-8004 integration | ✅ Agent registers itself on blockchain | ❌ Not implemented entirely |
| Payment Bypass | ✅ Seamless referral codes | ❌ Fixed paywalls |
| On-chain proof | ✅ txHash per data fetch | ❌ Off-chain only |
| LLM synthesis | ✅ Intelligent collation into Markdown | ❌ Raw unparsed JSON dumps |

---

*"Tony Stark didn't build the suit in a day — he built it in a cave with what he had. We built AgentMesh with an Arc Reactor and the finest UX on the planet."*
