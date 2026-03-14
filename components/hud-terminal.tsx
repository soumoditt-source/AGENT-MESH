"use client"

import { useEffect, useState } from "react"

interface Transaction {
  id: string
  type: "payment" | "receive" | "deploy" | "execute"
  amount: string
  description: string
  timestamp: string
  status: "confirmed" | "pending"
  hash: string
}

interface HUDTerminalProps {
  liveTxList?: { source: string; txHash: string }[]
  agentLogs?: string[]
}

const systemLogs = [
  "JARVIS v4.2.0 initialized",
  "x402 payment engine: ONLINE",
  "AgentMesh network: CONNECTED",
  "Avalanche Fuji (43113): ACTIVE",
  "Autonomous mode: ENABLED",
  "On-chain identity: VERIFIED",
]

export function HUDTerminal({ liveTxList = [], agentLogs = [] }: HUDTerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [networkStats, setNetworkStats] = useState({
    tps: 2847,
    latency: 18,
    uptime: "99.97%"
  })
  const showLive = agentLogs.length > 0 || liveTxList.length > 0

  useEffect(() => {
    if (showLive) {
      setLogs(agentLogs.slice(-6))
      return
    }
    if (currentLogIndex < systemLogs.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, systemLogs[currentLogIndex]])
        setCurrentLogIndex(prev => prev + 1)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [currentLogIndex, showLive, agentLogs])

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats({
        tps:     Math.floor(Math.random() * 1000) + 2500,
        latency: Math.floor(Math.random() * 20) + 12,
        uptime:  "99.97%"
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Build transaction cards from live data or mock
  const txCards: Transaction[] = liveTxList.length > 0
    ? liveTxList.slice(-5).map((tx, i) => ({
        id:          String(i),
        type:        "payment" as const,
        amount:      "0.1 USDC",
        description: `${tx.source} — x402 payment`,
        timestamp:   new Date().toLocaleTimeString('en-US', { hour12: false }),
        status:      "confirmed" as const,
        hash:        tx.txHash.slice(0, 6) + "…" + tx.txHash.slice(-4),
      }))
    : [
        { id:"1", type:"payment", amount:"0.1 USDC", description:"NewsAPI — x402 payment", timestamp:"12:17:08", status:"confirmed", hash:"0x8f3a…b2e1" },
        { id:"2", type:"execute", amount:"0.1 USDC", description:"arXiv — x402 payment",   timestamp:"12:17:12", status:"confirmed", hash:"0x2c7b…a9f4" },
        { id:"3", type:"execute", amount:"0.1 USDC", description:"Reddit — x402 payment",  timestamp:"12:17:18", status:"confirmed", hash:"0x6d1e…c3b8" },
        { id:"4", type:"deploy",  amount:"0 AVAX",   description:"ERC-8004 register",       timestamp:"12:17:25", status:"confirmed", hash:"0x9a4f…d7e2" },
      ]

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "payment": return "⚡"
      case "receive": return "↓"
      case "deploy":  return "◆"
      case "execute": return "⚡"
    }
  }
  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "payment": return "text-yellow-400"
      case "receive": return "text-green-400"
      case "deploy":  return "text-cyan-400"
      case "execute": return "text-yellow-400"
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-cyan-400/30 bg-card/80 backdrop-blur-sm overflow-hidden"
      style={{ boxShadow: '0 0 30px rgba(0,200,255,0.15)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-3 font-mono text-sm text-cyan-400">JARVIS_TERMINAL_v4.2</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span>TPS: <span className="text-cyan-400">{networkStats.tps}</span></span>
          <span>LATENCY: <span className="text-cyan-400">{networkStats.latency}ms</span></span>
          <span>UPTIME: <span className="text-green-400">{networkStats.uptime}</span></span>
        </div>
      </div>

      {/* System Logs */}
      <div className="border-b border-cyan-400/20 bg-background/50 px-4 py-3">
        <div className="mb-2 font-mono text-xs text-muted-foreground">
          {showLive ? 'AGENT_LOG' : 'SYSTEM_LOG'}
          {showLive && <span className="ml-2 text-yellow-400 animate-pulse">● LIVE</span>}
        </div>
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-2 text-cyan-300">
              <span className="text-muted-foreground">[{String(i + 1).padStart(2, '0')}]</span>
              <span>{log}</span>
              {i === logs.length - 1 && <span className="animate-pulse text-cyan-400">_</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">TRANSACTION_FEED</span>
          <span className="font-mono text-xs text-green-400 animate-pulse">● LIVE</span>
        </div>
        <div className="space-y-2">
          {txCards.map((tx, i) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${getTypeColor(tx.type)}`}>{getTypeIcon(tx.type)}</span>
                <div>
                  <div className="font-mono text-sm text-foreground">{tx.description}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {tx.hash}
                    {liveTxList[i] && (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${liveTxList[i < liveTxList.length ? i : 0].txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-cyan-400 hover:underline"
                      >↗ Snowtrace</a>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-medium text-yellow-400">−{tx.amount}</div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground">{tx.timestamp}</span>
                  <span className={tx.status === "confirmed" ? "text-green-400" : "text-yellow-400"}>
                    {tx.status === "confirmed" ? "✓" : "◐"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="border-t border-cyan-400/20 bg-background/50 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-cyan-400">{">"}</span>
          <span className="text-muted-foreground">agent.execute</span>
          <span className="text-foreground">(</span>
          <span className="text-yellow-400">{'"autonomous_payment"'}</span>
          <span className="text-foreground">)</span>
          <span className="animate-pulse text-cyan-400">_</span>
        </div>
      </div>
    </div>
  )
}
