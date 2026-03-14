"use client"

import { useEffect, useRef } from "react"

interface ScrollArcReactorProps {
  position: 'left' | 'right'
  scrollY: number
  index: number
}

export function ScrollArcReactor({ position, scrollY, index }: ScrollArcReactorProps) {
  const reactorRef = useRef<HTMLDivElement>(null)
  
  // Calculate animation values based on scroll
  const baseOffset = index * 800
  const scrollProgress = Math.max(0, Math.min(1, (scrollY - baseOffset) / 600))
  const rotationX = scrollProgress * 720 + scrollY * 0.1
  const rotationY = scrollProgress * 540 * (position === 'left' ? 1 : -1)
  const rotationZ = scrollProgress * 360
  const translateY = Math.sin(scrollProgress * Math.PI) * -100
  const scale = 0.5 + scrollProgress * 0.5
  const opacity = scrollProgress > 0 && scrollProgress < 1 ? 1 : Math.max(0, 1 - Math.abs(scrollProgress - 0.5) * 4)

  return (
    <div
      ref={reactorRef}
      className={`fixed ${position === 'left' ? 'left-[5%]' : 'right-[5%]'} z-30 pointer-events-none`}
      style={{
        top: `${30 + index * 10}%`,
        transform: `
          perspective(1000px)
          translateY(${translateY}px)
          rotateX(${rotationX}deg)
          rotateY(${rotationY}deg)
          rotateZ(${rotationZ}deg)
          scale(${scale})
        `,
        opacity: opacity,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      {/* Arc Reactor 3D Structure */}
      <div className="relative w-32 h-32 md:w-48 md:h-48" style={{ transformStyle: 'preserve-3d' }}>
        {/* Outer ring */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-cyan-400/60"
          style={{
            boxShadow: '0 0 30px rgba(0,200,255,0.5), inset 0 0 20px rgba(0,200,255,0.3)',
            transform: 'translateZ(10px)'
          }}
        />
        
        {/* Middle ring segments */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-6 bg-cyan-400/80 rounded-sm"
            style={{
              top: '50%',
              left: '50%',
              transform: `
                translateX(-50%) translateY(-50%)
                rotate(${i * 30}deg)
                translateY(-45px)
                translateZ(5px)
              `,
              boxShadow: '0 0 15px rgba(0,200,255,0.8)'
            }}
          />
        ))}

        {/* Inner rotating ring */}
        <div 
          className="absolute inset-8 rounded-full border-2 border-cyan-300/70"
          style={{
            animation: 'spin-slow 3s linear infinite',
            boxShadow: '0 0 20px rgba(0,255,255,0.4)',
            transform: 'translateZ(15px)'
          }}
        />

        {/* Central triangle */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'translateZ(20px)' }}
        >
          <svg 
            className="w-16 h-16 md:w-24 md:h-24" 
            viewBox="0 0 100 100"
            style={{ animation: 'spin-reverse 4s linear infinite' }}
          >
            <polygon 
              points="50,15 85,80 15,80" 
              fill="rgba(0,200,255,0.3)"
              stroke="rgba(0,255,255,0.9)" 
              strokeWidth="3"
              style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,255,0.9))' }}
            />
          </svg>
        </div>

        {/* Core glow */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.8) 30%, rgba(0,200,255,0.4) 60%, transparent 80%)',
              boxShadow: '0 0 40px rgba(0,255,255,0.8), 0 0 80px rgba(0,200,255,0.5), 0 0 120px rgba(0,150,200,0.3)',
              animation: 'pulse-bright 2s ease-in-out infinite'
            }}
          />
        </div>

        {/* Energy arcs */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `rotate(${i * 120}deg) translateZ(${12 + i * 3}px)`,
              animation: `spin-slow ${3 + i}s linear infinite ${i * 0.5}s`
            }}
          >
            <div 
              className="absolute w-1 h-8 left-1/2 -translate-x-1/2"
              style={{
                top: '5%',
                background: 'linear-gradient(to bottom, rgba(0,255,255,0.9), transparent)',
                boxShadow: '0 0 10px rgba(0,255,255,0.8)'
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-bright {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 40px rgba(0,255,255,0.8), 0 0 80px rgba(0,200,255,0.5);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 60px rgba(0,255,255,1), 0 0 100px rgba(0,200,255,0.7), 0 0 140px rgba(0,150,200,0.4);
          }
        }
      `}</style>
    </div>
  )
}
