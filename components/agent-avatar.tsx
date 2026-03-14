"use client"

import { ArcReactor } from "./arc-reactor"

export function AgentAvatar() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* HUD frame corners */}
      <div className="absolute inset-0">
        {/* Top left */}
        <div className="absolute left-0 top-0">
          <div className="h-px w-16 bg-primary/50" />
          <div className="h-16 w-px bg-primary/50" />
        </div>
        {/* Top right */}
        <div className="absolute right-0 top-0">
          <div className="h-px w-16 bg-primary/50 ml-auto" />
          <div className="h-16 w-px bg-primary/50 ml-auto" />
        </div>
        {/* Bottom left */}
        <div className="absolute bottom-0 left-0">
          <div className="h-16 w-px bg-primary/50" />
          <div className="h-px w-16 bg-primary/50" />
        </div>
        {/* Bottom right */}
        <div className="absolute bottom-0 right-0">
          <div className="h-16 w-px bg-primary/50 ml-auto" />
          <div className="h-px w-16 bg-primary/50 ml-auto" />
        </div>
      </div>

      {/* Agent silhouette / suit representation */}
      <div className="relative mb-4 p-8">
        {/* Suit helmet representation */}
        <svg viewBox="0 0 120 140" className="h-48 w-40" fill="none">
          <defs>
            <linearGradient id="suitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="50%" stopColor="#16213e" />
              <stop offset="100%" stopColor="#0f0f23" />
            </linearGradient>
            <filter id="suitGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Helmet shape */}
          <path 
            d="M60 10 C20 10 10 40 10 70 C10 100 30 130 60 130 C90 130 110 100 110 70 C110 40 100 10 60 10" 
            fill="url(#suitGradient)"
            stroke="#00c8ff"
            strokeWidth="1"
            filter="url(#suitGlow)"
          />
          
          {/* Face plate */}
          <path 
            d="M60 25 C35 25 25 50 25 75 C25 95 40 115 60 115 C80 115 95 95 95 75 C95 50 85 25 60 25" 
            fill="#0a1628"
            stroke="#00c8ff"
            strokeWidth="0.5"
            opacity="0.8"
          />
          
          {/* Eyes */}
          <path 
            d="M30 60 L50 55 L50 75 L30 70 Z" 
            fill="#00c8ff"
            filter="url(#suitGlow)"
            className="animate-pulse"
          />
          <path 
            d="M90 60 L70 55 L70 75 L90 70 Z" 
            fill="#00c8ff"
            filter="url(#suitGlow)"
            className="animate-pulse"
          />
          
          {/* Center line */}
          <line x1="60" y1="25" x2="60" y2="115" stroke="#00c8ff" strokeWidth="0.5" opacity="0.3" />
          
          {/* Mouth area accent */}
          <path 
            d="M45 90 Q60 95 75 90" 
            fill="none"
            stroke="#00c8ff"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>

        {/* Status indicators */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Hands holding Arc Reactor visualization */}
      <div className="relative">
        {/* Hand outlines */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 60 80" className="h-20 w-14 opacity-50">
            <path 
              d="M30 10 C15 10 5 30 5 50 L5 70 L25 70 L25 50 L30 45 L35 50 L35 70 L55 70 L55 50 C55 30 45 10 30 10"
              fill="none"
              stroke="#00c8ff"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 scale-x-[-1]">
          <svg viewBox="0 0 60 80" className="h-20 w-14 opacity-50">
            <path 
              d="M30 10 C15 10 5 30 5 50 L5 70 L25 70 L25 50 L30 45 L35 50 L35 70 L55 70 L55 50 C55 30 45 10 30 10"
              fill="none"
              stroke="#00c8ff"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Arc Reactor in center (being held) */}
        <div className="relative z-10 arc-glow rounded-full">
          <ArcReactor size={160} />
        </div>

        {/* Energy lines connecting to hands */}
        <div className="absolute left-0 top-1/2 h-px w-8 -translate-y-1/2 bg-primary/50" />
        <div className="absolute right-0 top-1/2 h-px w-8 -translate-y-1/2 bg-primary/50" />
      </div>

      {/* Label */}
      <div className="mt-6 text-center">
        <div className="font-mono text-xs text-muted-foreground mb-1">AUTONOMOUS AGENT</div>
        <div className="font-mono text-lg font-bold text-primary text-glow">J.A.R.V.I.S.</div>
        <div className="font-mono text-xs text-muted-foreground">Just A Rather Very Intelligent System</div>
      </div>
    </div>
  )
}
