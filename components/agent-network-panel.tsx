"use client"

import { useEffect, useState, useRef } from "react"
import { FloatingHUDPanel } from "./floating-hud-panel"

interface Agent {
  id: string
  name: string
  x: number
  y: number
  type: "master" | "sub"
}

const agents: Agent[] = [
  { id: "master", name: "Master Agent", x: 50, y: 50, type: "master" },
  { id: "news", name: "News Agent", x: 20, y: 25, type: "sub" },
  { id: "market1", name: "Market", x: 80, y: 20, type: "sub" },
  { id: "nest", name: "Nest Agent", x: 25, y: 80, type: "sub" },
  { id: "market2", name: "Market", x: 75, y: 75, type: "sub" },
]

const connections = [
  ["master", "news"],
  ["master", "market1"],
  ["master", "nest"],
  ["master", "market2"],
  ["news", "market1"],
  ["nest", "market2"],
]

export function AgentNetworkPanel() {
  const [activeConnection, setActiveConnection] = useState(0)
  const [particles, setParticles] = useState<{x: number, y: number, progress: number}[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnection((prev) => (prev + 1) % connections.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Animate particles along connections
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particleProgress = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      connections.forEach(([from, to], index) => {
        const fromAgent = agents.find(a => a.id === from)
        const toAgent = agents.find(a => a.id === to)
        if (!fromAgent || !toAgent) return

        const fromX = (fromAgent.x / 100) * canvas.width
        const fromY = (fromAgent.y / 100) * canvas.height
        const toX = (toAgent.x / 100) * canvas.width
        const toY = (toAgent.y / 100) * canvas.height

        // Draw line
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.strokeStyle = index === activeConnection 
          ? 'rgba(0, 200, 255, 0.6)' 
          : 'rgba(0, 200, 255, 0.15)'
        ctx.lineWidth = index === activeConnection ? 2 : 1
        ctx.stroke()

        // Draw particle on active connection
        if (index === activeConnection) {
          const px = fromX + (toX - fromX) * particleProgress
          const py = fromY + (toY - fromY) * particleProgress

          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 255, 200, 0.9)'
          ctx.fill()

          // Glow effect
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, 12)
          gradient.addColorStop(0, 'rgba(0, 255, 200, 0.5)')
          gradient.addColorStop(1, 'rgba(0, 255, 200, 0)')
          ctx.beginPath()
          ctx.arc(px, py, 12, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      particleProgress += 0.02
      if (particleProgress > 1) particleProgress = 0

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [activeConnection])

  return (
    <FloatingHUDPanel 
      title="Agent Network Visualization" 
      className="w-[320px]"
      animationDelay={600}
      position="right"
    >
      <div className="relative h-[200px]">
        <canvas 
          ref={canvasRef} 
          width={288} 
          height={200} 
          className="absolute inset-0"
        />
        
        {/* Agent nodes */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${agent.type === "master" 
                ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(0,200,255,0.5)]" 
                : "bg-gradient-to-br from-cyan-600/50 to-blue-700/50 border border-cyan-400/30"
              }
            `}>
              <span className="font-mono text-[10px] font-bold text-foreground">
                {agent.type === "master" ? "M" : "A"}
              </span>
            </div>
            <span className="font-mono text-[9px] text-cyan-300/80 mt-1 whitespace-nowrap">
              {agent.name}
            </span>
          </div>
        ))}
      </div>

      {/* Network Stats */}
      <div className="mt-2 pt-2 border-t border-cyan-400/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">5 Agents Connected</span>
        </div>
        <span className="font-mono text-[10px] text-cyan-400">6 Active Links</span>
      </div>
    </FloatingHUDPanel>
  )
}
