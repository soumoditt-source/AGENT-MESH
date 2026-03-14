"use client"

import { useMemo } from "react"

interface DynamicBackgroundProps {
  scrollY: number
  maxScroll: number
}

export function DynamicBackground({ scrollY, maxScroll }: DynamicBackgroundProps) {
  const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0
  
  // Dynamic color transitions based on scroll
  const phase = Math.floor(scrollProgress * 4) // 0-3 phases
  
  const backgrounds = useMemo(() => ({
    0: {
      gradient: 'radial-gradient(ellipse at 50% 0%, rgba(0,40,60,0.8) 0%, rgba(8,20,35,1) 50%, rgba(5,10,20,1) 100%)',
      accent: 'rgba(0,200,255,0.1)',
      gridOpacity: 0.15
    },
    1: {
      gradient: 'radial-gradient(ellipse at 30% 50%, rgba(0,50,80,0.6) 0%, rgba(10,25,45,1) 40%, rgba(5,15,30,1) 100%)',
      accent: 'rgba(0,180,220,0.15)',
      gridOpacity: 0.2
    },
    2: {
      gradient: 'radial-gradient(ellipse at 70% 50%, rgba(0,60,100,0.5) 0%, rgba(12,30,50,1) 40%, rgba(8,20,35,1) 100%)',
      accent: 'rgba(0,220,255,0.12)',
      gridOpacity: 0.25
    },
    3: {
      gradient: 'radial-gradient(ellipse at 50% 100%, rgba(0,80,120,0.4) 0%, rgba(15,35,55,1) 40%, rgba(10,25,40,1) 100%)',
      accent: 'rgba(0,255,255,0.1)',
      gridOpacity: 0.3
    }
  }), [])

  const currentBg = backgrounds[phase as keyof typeof backgrounds] || backgrounds[0]
  const nextBg = backgrounds[Math.min(phase + 1, 3) as keyof typeof backgrounds]
  const phaseProgress = (scrollProgress * 4) % 1

  // Interpolate values
  const gridOpacity = currentBg.gridOpacity + (nextBg.gridOpacity - currentBg.gridOpacity) * phaseProgress

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient layer */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: currentBg.gradient }}
      />
      
      {/* Overlay gradient layer for smooth transition */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={{ 
          background: nextBg.gradient,
          opacity: phaseProgress 
        }}
      />

      {/* Animated grid */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(rgba(0,200,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${60 - scrollProgress * 20}px ${60 - scrollProgress * 20}px`,
          transform: `perspective(1000px) rotateX(${60 - scrollProgress * 20}deg)`,
          transformOrigin: 'center bottom'
        }}
      />

      {/* Horizontal perspective lines */}
      <div 
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${100 - scrollProgress * 30}px,
            rgba(0,200,255,${0.03 + scrollProgress * 0.02}) ${100 - scrollProgress * 30}px,
            rgba(0,200,255,${0.03 + scrollProgress * 0.02}) ${101 - scrollProgress * 30}px
          )`,
          transform: `perspective(800px) rotateX(${70 - scrollProgress * 15}deg)`,
          transformOrigin: 'center 80%',
          opacity: 0.5
        }}
      />

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => {
        const delay = i * 1.5
        const size = 100 + i * 50
        const xPos = 10 + (i * 15) % 80
        const yOffset = Math.sin((scrollProgress * Math.PI * 2) + i) * 50

        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size,
              height: size,
              left: `${xPos}%`,
              top: `${20 + i * 12 + yOffset}%`,
              background: `radial-gradient(circle, rgba(0,200,255,${0.1 - i * 0.01}) 0%, transparent 70%)`,
              filter: 'blur(40px)',
              animation: `float-orb ${8 + i * 2}s ease-in-out infinite ${delay}s`,
              transform: `translateY(${scrollY * (0.1 + i * 0.02)}px)`
            }}
          />
        )
      })}

      {/* Energy streams */}
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <defs>
          <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,200,255,0)" />
            <stop offset="50%" stopColor="rgba(0,200,255,0.5)" />
            <stop offset="100%" stopColor="rgba(0,200,255,0)" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => {
          const startX = 0
          const startY = 20 + i * 20
          const midX = 50
          const midY = startY + Math.sin(scrollProgress * Math.PI + i) * 10
          const endX = 100
          const endY = startY + (scrollProgress - 0.5) * 20

          return (
            <path
              key={i}
              d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
              fill="none"
              stroke="url(#streamGradient)"
              strokeWidth="0.5"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000 - scrollY * 0.5,
                opacity: 0.3 + scrollProgress * 0.3
              }}
            />
          )
        })}
      </svg>

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          )`,
          animation: 'scanline-move 10s linear infinite'
        }}
      />

      {/* Corner vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      <style jsx>{`
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-40px) translateX(5px); }
        }
        @keyframes scanline-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
      `}</style>
    </div>
  )
}
