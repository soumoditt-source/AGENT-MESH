"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

export function HeroCharacter() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15
      const y = (e.clientY / window.innerHeight - 0.5) * 8
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{
        transform: `perspective(1200px) rotateY(${mousePosition.x * 0.15}deg) rotateX(${-mousePosition.y * 0.1}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Multiple layered glow effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Outer glow */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(0,150,200,0.2) 0%, rgba(0,80,120,0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Inner core glow */}
        <div 
          className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(0,220,255,0.25) 0%, rgba(0,150,200,0.1) 50%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>

      {/* Main character image container */}
      <div className="relative">
        {/* Secondary image layer for depth */}
        <div 
          className="absolute inset-0 opacity-30 blur-sm scale-105 pointer-events-none"
          style={{ transform: `translateZ(-20px)` }}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whisk_igzihjzwmwm4yjn50co3idotctn4qtl2qtzh1cz-4zwfE3TFaU3OeniqGXIptElcGnHAL5.jpeg"
            alt=""
            width={700}
            height={700}
            className="object-contain max-h-[80vh] w-auto"
            style={{
              filter: 'brightness(0.5) saturate(1.2)',
            }}
          />
        </div>

        {/* Primary character image */}
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whisk_igzihjzwmwm4yjn50co3idotctn4qtl2qtzh1cz-4zwfE3TFaU3OeniqGXIptElcGnHAL5.jpeg"
          alt="AgentMesh AI Agent - Iron Man inspired autonomous agent holding Arc Reactor"
          width={700}
          height={700}
          priority
          className="relative object-contain max-h-[80vh] w-auto animate-float-slow"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(0,200,255,0.4)) drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            transform: 'translateZ(30px)'
          }}
        />

        {/* Arc Reactor chest glow */}
        <div 
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,240,255,0.9) 0%, rgba(0,200,255,0.5) 30%, rgba(0,150,200,0.2) 60%, transparent 80%)',
            boxShadow: '0 0 60px rgba(0,200,255,0.7), 0 0 100px rgba(0,150,200,0.5), 0 0 140px rgba(0,100,150,0.3)',
            animation: 'pulse-glow 2s ease-in-out infinite',
            transform: 'translateZ(50px)'
          }}
        />

        {/* Palm energy orb glow */}
        <div 
          className="absolute left-[25%] top-[52%] w-16 h-16 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,240,0.8) 0%, rgba(0,200,255,0.4) 40%, transparent 70%)',
            boxShadow: '0 0 40px rgba(0,220,255,0.6), 0 0 80px rgba(0,180,220,0.4), 0 0 120px rgba(0,150,200,0.2)',
            animation: 'pulse-glow 2.5s ease-in-out infinite 0.5s',
            transform: 'translateZ(60px)'
          }}
        />
      </div>

      {/* Floating HUD elements around character */}
      <div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/60 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-400/30 shadow-[0_0_20px_rgba(0,200,255,0.2)]"
        style={{ transform: `translateZ(40px)` }}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <span className="font-mono text-xs font-medium text-cyan-300 tracking-wider">SYSTEM ONLINE</span>
        <span className="font-mono text-[10px] text-cyan-400/60">v1.0.0</span>
      </div>

      <div 
        className="absolute top-20 -left-4 flex items-center gap-2 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-400/20"
        style={{ transform: `translateZ(35px) rotateY(10deg)` }}
      >
        <span className="font-mono text-[10px] text-cyan-400">JARVIS-CLASS</span>
      </div>

      <div 
        className="absolute top-20 -right-4 flex items-center gap-2 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-400/20"
        style={{ transform: `translateZ(35px) rotateY(-10deg)` }}
      >
        <span className="font-mono text-[10px] text-cyan-400">x402 ENGINE</span>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gradient-to-r from-cyan-950/80 via-background/80 to-cyan-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/30 shadow-[0_0_30px_rgba(0,200,255,0.2)]"
        style={{ transform: `translateZ(45px)` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs font-medium text-foreground">AUTONOMOUS</span>
        </div>
        <div className="w-px h-4 bg-cyan-400/30" />
        <span className="font-mono text-xs font-bold text-cyan-400 animate-pulse">ACTIVE</span>
      </div>
    </div>
  )
}
