"use client"

import { useEffect, useState } from "react"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'initializing' | 'complete'>('loading')
  const [glitchText, setGlitchText] = useState('AGENTMESH')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789'
    const originalText = 'AGENTMESH'
    
    // Glitch effect
    const glitchInterval = setInterval(() => {
      if (phase === 'loading') {
        const glitched = originalText.split('').map((char, i) => {
          if (Math.random() > 0.7) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }
          return char
        }).join('')
        setGlitchText(glitched)
      } else {
        setGlitchText(originalText)
      }
    }, 50)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setPhase('initializing')
          setTimeout(() => {
            setPhase('complete')
            setTimeout(onComplete, 500)
          }, 800)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete, phase])

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-all duration-700 ${
        phase === 'complete' ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'
      }`}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'data-flow 20s linear infinite'
        }}
      />

      {/* Central Arc Reactor Loading */}
      <div className="relative mb-12">
        {/* Outer spinning ring */}
        <div 
          className="absolute inset-0 w-48 h-48 rounded-full border-2 border-cyan-400/30"
          style={{
            animation: 'spin 3s linear infinite',
            boxShadow: '0 0 30px rgba(0,200,255,0.2)'
          }}
        />
        
        {/* Middle spinning ring (opposite direction) */}
        <div 
          className="absolute inset-4 w-40 h-40 rounded-full border border-cyan-400/50"
          style={{
            animation: 'spin 2s linear infinite reverse',
          }}
        />

        {/* Inner pulsing core */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(0,200,255,0.4) 40%, transparent 70%)',
              boxShadow: '0 0 60px rgba(0,200,255,0.6), 0 0 100px rgba(0,150,200,0.4), inset 0 0 30px rgba(0,255,255,0.3)',
              animation: 'pulse-glow 1.5s ease-in-out infinite'
            }}
          />
          
          {/* Center triangle reactor */}
          <svg className="absolute w-16 h-16" viewBox="0 0 100 100" style={{ animation: 'spin 4s linear infinite' }}>
            <polygon 
              points="50,10 90,85 10,85" 
              fill="none" 
              stroke="rgba(0,255,255,0.8)" 
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.8))' }}
            />
          </svg>
        </div>

        {/* Energy particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-60px)`,
              boxShadow: '0 0 10px rgba(0,200,255,0.8)',
              animation: `pulse 1s ease-in-out infinite ${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Glitch title */}
      <h1 
        className="font-mono text-4xl md:text-6xl font-bold tracking-[0.3em] mb-8"
        style={{
          color: 'rgb(0, 200, 255)',
          textShadow: '0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.3)',
          animation: phase === 'loading' ? 'none' : 'text-glow 2s ease-in-out infinite'
        }}
      >
        {glitchText}
      </h1>

      {/* Progress bar */}
      <div className="w-64 md:w-96 h-1 bg-cyan-900/30 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, rgba(0,150,200,0.8), rgba(0,255,255,1), rgba(0,150,200,0.8))',
            boxShadow: '0 0 20px rgba(0,200,255,0.8)'
          }}
        />
      </div>

      {/* Status text */}
      <div className="font-mono text-sm text-cyan-400/80 tracking-wider">
        {phase === 'loading' && (
          <span>LOADING x402 ENGINE... {Math.floor(Math.min(progress, 100))}%</span>
        )}
        {phase === 'initializing' && (
          <span className="animate-pulse">INITIALIZING AUTONOMOUS SYSTEMS...</span>
        )}
        {phase === 'complete' && (
          <span>SYSTEM READY</span>
        )}
      </div>

      {/* Binary rain effect */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute font-mono text-xs text-cyan-400 whitespace-nowrap"
              style={{
                left: `${i * 5}%`,
                top: '-100%',
                animation: `fall ${3 + Math.random() * 5}s linear infinite ${Math.random() * 3}s`
              }}
            >
              {[...Array(30)].map((_, j) => (
                <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: rotate(var(--rotation, 0deg)) translateY(-60px) scale(0.8); }
          50% { opacity: 1; transform: rotate(var(--rotation, 0deg)) translateY(-60px) scale(1.2); }
        }
        @keyframes fall {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.3); }
          50% { text-shadow: 0 0 30px rgba(0,200,255,0.8), 0 0 60px rgba(0,200,255,0.5), 0 0 80px rgba(0,200,255,0.3); }
        }
      `}</style>
    </div>
  )
}
