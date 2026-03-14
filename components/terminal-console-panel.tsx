"use client"

import { useEffect, useState, useRef } from "react"
import { FloatingHUDPanel } from "./floating-hud-panel"

const terminalLines = [
  { type: "system", text: "■ AgentMesh Research Agent v1.0.0" },
  { type: "system", text: "■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■" },
  { type: "info", text: "→ Initializing x402 payment engine..." },
  { type: "success", text: "✓ Connection established: avalanche-fuji" },
  { type: "info", text: "→ Generating research plan..." },
  { type: "data", text: "  Sub-queries: crypto trends | DeFi analysis | market sentiment" },
  { type: "warning", text: "  402 Detected → Paying 0.1 USDC to 0x7a2B..." },
  { type: "success", text: "  ✓ Paid! txHash: 0x9f8e7d6c5b4a3..." },
  { type: "link", text: "  Explorer: https://testnet.snowtrace.io/tx/0x9f8e..." },
  { type: "info", text: "→ Sub-Agent 1: \"crypto market trends 2025\"" },
  { type: "success", text: "  ✓ Data received: 847 bytes" },
  { type: "info", text: "→ Synthesizing report with Gemini..." },
  { type: "success", text: "✓ Report complete: output/report_1710892847.md" },
  { type: "info", text: "→ Registering agent on ERC-8004..." },
  { type: "success", text: "✓ Agent registered! TokenID: #1847" },
]

export function TerminalConsolePanel() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= terminalLines.length) {
          // Reset after showing all lines
          setTimeout(() => setVisibleLines(0), 2000)
          return prev
        }
        return prev + 1
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleLines])

  const getLineColor = (type: string) => {
    switch (type) {
      case "system": return "text-cyan-300"
      case "info": return "text-cyan-400"
      case "success": return "text-green-400"
      case "warning": return "text-yellow-400"
      case "error": return "text-red-400"
      case "link": return "text-blue-400"
      case "data": return "text-muted-foreground"
      default: return "text-foreground"
    }
  }

  return (
    <FloatingHUDPanel 
      title="Terminal Console" 
      className="w-[380px]"
      animationDelay={0}
      position="left"
    >
      <div 
        ref={scrollRef}
        className="h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/20 scrollbar-track-transparent"
      >
        <div className="font-mono text-[11px] leading-relaxed space-y-0.5">
          {terminalLines.slice(0, visibleLines).map((line, index) => (
            <div 
              key={index} 
              className={`${getLineColor(line.type)} transition-opacity duration-200`}
              style={{ opacity: index === visibleLines - 1 ? 1 : 0.9 }}
            >
              {line.text}
            </div>
          ))}
          
          {/* Cursor */}
          {visibleLines < terminalLines.length && (
            <span className={`inline-block w-2 h-4 bg-cyan-400 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="mt-3 pt-2 border-t border-cyan-400/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="font-mono text-[9px] text-muted-foreground">CONNECTED</span>
          </div>
          <div className="font-mono text-[9px] text-cyan-400/60">Chain: 43113</div>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground">
          {visibleLines}/{terminalLines.length} lines
        </div>
      </div>
    </FloatingHUDPanel>
  )
}
