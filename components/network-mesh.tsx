"use client"

import { useEffect, useState } from "react"

interface Node {
  id: string
  x: number
  y: number
  type: "core" | "agent" | "endpoint"
  active: boolean
}

const nodes: Node[] = [
  { id: "core", x: 50, y: 50, type: "core", active: true },
  { id: "a1", x: 20, y: 30, type: "agent", active: true },
  { id: "a2", x: 80, y: 25, type: "agent", active: true },
  { id: "a3", x: 15, y: 70, type: "agent", active: true },
  { id: "a4", x: 85, y: 75, type: "agent", active: true },
  { id: "e1", x: 5, y: 15, type: "endpoint", active: true },
  { id: "e2", x: 35, y: 10, type: "endpoint", active: true },
  { id: "e3", x: 65, y: 8, type: "endpoint", active: true },
  { id: "e4", x: 95, y: 20, type: "endpoint", active: true },
  { id: "e5", x: 5, y: 50, type: "endpoint", active: true },
  { id: "e6", x: 95, y: 50, type: "endpoint", active: true },
  { id: "e7", x: 5, y: 85, type: "endpoint", active: true },
  { id: "e8", x: 35, y: 95, type: "endpoint", active: true },
  { id: "e9", x: 65, y: 92, type: "endpoint", active: true },
  { id: "e10", x: 95, y: 88, type: "endpoint", active: true },
]

const connections = [
  ["core", "a1"], ["core", "a2"], ["core", "a3"], ["core", "a4"],
  ["a1", "e1"], ["a1", "e2"], ["a1", "e5"],
  ["a2", "e3"], ["a2", "e4"], ["a2", "e6"],
  ["a3", "e5"], ["a3", "e7"], ["a3", "e8"],
  ["a4", "e6"], ["a4", "e9"], ["a4", "e10"],
]

export function NetworkMesh() {
  const [activeConnection, setActiveConnection] = useState(0)
  const [pulsingNodes, setPulsingNodes] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnection(prev => (prev + 1) % connections.length)
      
      // Pulse nodes involved in active connection
      const [from, to] = connections[activeConnection]
      setPulsingNodes([from, to])
      setTimeout(() => setPulsingNodes([]), 500)
    }, 800)
    return () => clearInterval(interval)
  }, [activeConnection])

  const getNodeById = (id: string) => nodes.find(n => n.id === id)

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c8ff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00c8ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00c8ff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {connections.map(([fromId, toId], i) => {
          const from = getNodeById(fromId)
          const to = getNodeById(toId)
          if (!from || !to) return null
          
          const isActive = i === activeConnection
          
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? "#00c8ff" : "#00c8ff"}
              strokeWidth={isActive ? "0.5" : "0.2"}
              opacity={isActive ? 1 : 0.3}
              className={isActive ? "animate-pulse" : ""}
            />
          )
        })}

        {/* Data packet animation */}
        {connections.map(([fromId, toId], i) => {
          const from = getNodeById(fromId)
          const to = getNodeById(toId)
          if (!from || !to || i !== activeConnection) return null
          
          return (
            <circle
              key={`packet-${i}`}
              r="0.8"
              fill="#00ffff"
              filter="url(#nodeGlow)"
            >
              <animateMotion
                dur="0.8s"
                repeatCount="1"
                path={`M${from.x},${from.y} L${to.x},${to.y}`}
              />
            </circle>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isPulsing = pulsingNodes.includes(node.id)
          const size = node.type === "core" ? 3 : node.type === "agent" ? 2 : 1
          
          return (
            <g key={node.id}>
              {/* Glow ring for active nodes */}
              {isPulsing && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size + 2}
                  fill="none"
                  stroke="#00c8ff"
                  strokeWidth="0.3"
                  opacity="0.5"
                  className="animate-ping"
                />
              )}
              
              {/* Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill={node.type === "core" ? "#00c8ff" : node.type === "agent" ? "#00a8cc" : "#006688"}
                filter="url(#nodeGlow)"
                className={isPulsing ? "animate-pulse" : ""}
              />
              
              {/* Core label */}
              {node.type === "core" && (
                <text
                  x={node.x}
                  y={node.y + 7}
                  textAnchor="middle"
                  fill="#00c8ff"
                  fontSize="3"
                  fontFamily="monospace"
                >
                  x402
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 font-mono text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Core Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary/70" />
          <span>Agent Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
          <span>Endpoint</span>
        </div>
      </div>
    </div>
  )
}
