# AGENTMESH END-TO-END ARCHITECTURE

This document is intended for AI Agents (like Google Antigravity) to understand the entire structure, flow, and architecture of the AgentMesh project.

## Overview
AgentMesh is an autonomous x402 research agent built on Node.js, Express, React, and Avalanche Fuji. It demonstrates a complete flow of an AI agent paying for API resources using cryptocurrency (USDC) via the `facinet` SDK, synthesizing data with Gemini AI, and registering its activity on a smart contract.

## System Components

### 1. Frontend UI (React + Vite + Tailwind)
- **Location**: `src/App.tsx`
- **Purpose**: Provides a user-friendly interface to configure and trigger the research agent.
- **Features**:
  - **Dark Mode**: Toggleable and persists in `localStorage`.
  - **Configuration**: Users can set the Research Topic, Priority Level (High/Medium/Low), and Max Retries.
  - **Toast Notifications**: User-friendly error and success handling.
  - **Loading Indicators**: Real-time feedback during the long-running agent process.
  - **Markdown Rendering**: Displays the final synthesized report.

### 2. Backend API & x402 Gateway (Express)
- **Location**: `server.js`
- **Purpose**: Serves the React frontend, hosts the API endpoint to trigger the agent, and acts as the mock x402 data provider.
- **Endpoints**:
  - `POST /api/run-agent`: Receives configuration from the frontend, executes the agent runner, and returns the report.
  - `GET /research/*`: Protected endpoints (News, Academic, Social, Tech, Wiki) that require an `X-Payment-Proof` header. If missing, they return an HTTP 402 Payment Required status with payment details.

### 3. Core Agent Logic
- **Location**: `lib/agentRunner.js`
- **Purpose**: The brain of the operation. It orchestrates the entire flow.
- **Flow**:
  1. Generates 3 sub-queries using Gemini AI based on the topic.
  2. Iterates through the queries and fetches data from the local x402 gateway.
  3. **Automatic Retry Mechanism**: If a request fails (e.g., network error), it retries up to the user-configured `maxRetries` with exponential backoff.
  4. **x402 Payment Flow**: If it receives a 402, it extracts the amount and recipient, pays via `facinet`, and retries with the transaction hash.
  5. Synthesizes the collected data into a comprehensive report using Gemini AI.
  6. Registers the agent's run on the Avalanche Fuji smart contract.
  7. Saves the report to the local file system and returns it to the caller.

### 4. AI Integration (Gemini)
- **Location**: `lib/gemini.js`
- **Purpose**: Handles all interactions with Google's Gemini AI.
- **Functions**:
  - `generateSubQueries`: Breaks down a broad topic into specific search queries.
  - `synthesizeReport`: Takes the raw JSON data from various APIs and writes a structured Markdown report.

### 5. Web3 Integration (Facinet & Smart Contracts)
- **Location**: `lib/facinet.js`, `contracts/AgentRegistry.sol`
- **Purpose**: Handles blockchain interactions.
- **Functions**:
  - `payForResource`: Executes gasless USDC transfers on Avalanche Fuji.
  - `registerAgent`: Calls the `AgentRegistry` smart contract to record the agent's activity.

## End-to-End Flow
1. User enters a topic in the React UI and clicks "Run Agent".
2. UI sends a POST request to `/api/run-agent`.
3. Express server calls `executeResearch` in `agentRunner.js`.
4. Agent generates sub-queries via Gemini.
5. Agent attempts to fetch data from `/research/news`.
6. Express middleware intercepts and returns HTTP 402.
7. Agent detects 402, initiates payment via `facinet`.
8. Agent retries fetch with `X-Payment-Proof`.
9. Express validates and returns data.
10. Agent repeats for all queries, handling any network failures with the retry mechanism.
11. Agent sends all data to Gemini for synthesis.
12. Agent registers on-chain.
13. Express returns the Markdown report to the React UI.
14. React UI renders the report and shows a success toast.

## How to Run
1. Configure `.env` with `GEMINI_API_KEY`, `NEWS_API_KEY`, `PRIVATE_KEY`, `RECIPIENT`, `REGISTRY_ADDRESS`.
2. Run `npm run server` to start the Express backend and Vite frontend.
3. Access the UI at `http://localhost:3000`.
4. Alternatively, use the CLI via `npm run agent "Your Topic" -p High -r 3`.
