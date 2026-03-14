"use client"

import { useEffect, useState } from "react"

export function ArcReactor({ size = 200 }: { size?: number }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 500)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          pulse ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(0,200,255,0.3) 0%, rgba(0,200,255,0.1) 40%, transparent 70%)',
        }}
      />
      
      {/* Main reactor body */}
      <svg 
        viewBox="0 0 200 200" 
        className="relative z-10"
        style={{ width: size, height: size }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0088cc" />
          </radialGradient>
          <radialGradient id="ringGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#004466" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <circle 
          cx="100" cy="100" r="95" 
          fill="none" 
          stroke="url(#ringGradient)" 
          strokeWidth="3"
          filter="url(#glow)"
          className={pulse ? 'opacity-100' : 'opacity-80'}
        />

        {/* Secondary ring */}
        <circle 
          cx="100" cy="100" r="80" 
          fill="none" 
          stroke="#00a8cc" 
          strokeWidth="2"
          filter="url(#glow)"
          opacity="0.7"
        />

        {/* Inner segments */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 100 100)`}>
            <rect 
              x="96" y="25" 
              width="8" height="25" 
              rx="2"
              fill="#00d4ff"
              filter="url(#glow)"
              className={pulse ? 'opacity-100' : 'opacity-70'}
            />
          </g>
        ))}

        {/* Middle ring */}
        <circle 
          cx="100" cy="100" r="55" 
          fill="none" 
          stroke="#00c8ff" 
          strokeWidth="4"
          filter="url(#glow)"
        />

        {/* Inner triangular segments */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 100 100)`}>
            <polygon 
              points="100,55 95,70 105,70" 
              fill="#00e8ff"
              filter="url(#glow)"
              opacity={pulse ? 1 : 0.8}
            />
          </g>
        ))}

        {/* Core */}
        <circle 
          cx="100" cy="100" r="35" 
          fill="url(#coreGradient)"
          filter="url(#glow)"
          className={`transition-all duration-300 ${pulse ? 'opacity-100' : 'opacity-90'}`}
        />

        {/* Core inner detail */}
        <circle 
          cx="100" cy="100" r="20" 
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />

        {/* Center bright spot */}
        <circle 
          cx="100" cy="100" r="10" 
          fill="white"
          filter="url(#glow)"
        />

        {/* x402 text */}
        <text 
          x="100" y="145" 
          textAnchor="middle" 
          fill="#00d4ff" 
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
          filter="url(#glow)"
        >
          x402
        </text>
      </svg>

      {/* Rotating energy ring */}
      <div 
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '10s' }}
      >
        <svg viewBox="0 0 200 200" style={{ width: size, height: size }}>
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" 
            stroke="url(#ringGradient)" 
            strokeWidth="1"
            strokeDasharray="10 20"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  )
}
