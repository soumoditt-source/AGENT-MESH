"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { FloatingHUDPanel } from "./floating-hud-panel"
import { CheckCircle, Loader2, Zap, AlertCircle } from "lucide-react"

interface AgentState {
  phase: 'idle' | 'running' | 'done' | 'error'
  payments: number
  usdc: number
  sources: string[]
  elapsed: string
  txList: { source: string; txHash: string }[]
  topic?: string
  error?: string
}

const DEMO_STEPS = [
  "Connecting to Avalanche Fuji Testnet…",
  "Generating sub-queries with Gemini AI…",
  "402 Payment Required detected",
  "Initiating USDC transfer via ERC-3009…",
  "Transaction confirmed on Fuji",
  "Fetching data from NewsAPI…",
  "Fetching data from arXiv…",
  "Fetching data from Reddit…",
  "Synthesizing report with Gemini…",
  "Registering agent on ERC-8004…",
]

interface ResearchAgentPanelProps {
  agentState?: AgentState
  currentStep?: number
}

export function ResearchAgentPanel({ agentState, currentStep }: ResearchAgentPanelProps) {
  const [animStep, setAnimStep] = useState(0)
  const isLive = agentState && agentState.phase !== 'idle'

  // Animate demo steps when idle
  useEffect(() => {
    if (isLive) return
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % (DEMO_STEPS.length + 2))
    }, 1800)
    return () => clearInterval(interval)
  }, [isLive])

  const displaySteps = isLive
    ? DEMO_STEPS.slice(0, currentStep !== undefined ? currentStep + 1 : 1)
    : DEMO_STEPS.slice(0, Math.min(animStep + 1, DEMO_STEPS.length))

  const phase = agentState?.phase || 'idle'

  return (
    <FloatingHUDPanel
      title="Research Agent"
      className="w-[320px]"
      animationDelay={300}
      position="right"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cyan-400/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center border border-cyan-400/30">
            <Zap className="w-5 h-5 text-cyan-300" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
            phase === 'running' ? 'bg-yellow-400 animate-pulse' :
            phase === 'done'    ? 'bg-green-400' :
            phase === 'error'   ? 'bg-red-400' :
            'bg-cyan-400 animate-pulse'
          }`} />
        </div>
        <div>
          <div className="font-mono text-sm font-semibold text-foreground">AgentMesh</div>
          <div className="font-mono text-[10px] text-cyan-400/70">
            {phase === 'running' ? 'EXECUTING…' : phase === 'done' ? 'COMPLETE' : phase === 'error' ? 'ERROR' : 'AUTONOMOUS MODE'}
          </div>
        </div>
      </div>

      {/* Topic */}
      <div className="mb-3">
        <div className="font-mono text-[10px] text-cyan-400/60 mb-1">Research Topic:</div>
        <div className="font-mono text-sm text-foreground font-medium truncate">
          {agentState?.topic || "DeFi Security 2025"}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5 max-h-40 overflow-hidden">
        {displaySteps.map((step, index) => {
          const stepDone = isLive
            ? (currentStep !== undefined && index < currentStep) || phase === 'done'
            : index < animStep
          const isActive = isLive
            ? index === currentStep && phase === 'running'
            : index === animStep - 1

          return (
            <div
              key={index}
              className={`flex items-center gap-2 font-mono text-xs transition-all duration-300 ${
                index <= (isLive ? (currentStep ?? 0) : animStep) ? "opacity-100" : "opacity-20"
              }`}
            >
              {stepDone ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-cyan-400/30 shrink-0" />
              )}
              <span className={stepDone || isActive ? "text-foreground/90" : "text-muted-foreground"}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-3 border-t border-cyan-400/10 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-cyan-300">
            {agentState?.payments ?? 3}
          </div>
          <div className="font-mono text-[9px] text-muted-foreground">Sub-Agents</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-green-400">
            {agentState?.usdc ? `$${agentState.usdc.toFixed(1)}` : "$0.3"}
          </div>
          <div className="font-mono text-[9px] text-muted-foreground">USDC Paid</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {phase === 'running' ? (
              <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 text-yellow-400" />
            )}
            <span className="font-mono text-sm font-bold text-yellow-400">
              {phase === 'done' ? 'Done' : phase === 'error' ? 'Err' : 'Live'}
            </span>
          </div>
          <div className="font-mono text-[9px] text-muted-foreground">Status</div>
        </div>
      </div>
    </FloatingHUDPanel>
  )
}
