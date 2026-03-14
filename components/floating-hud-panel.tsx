"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FloatingHUDPanelProps {
  title: string
  children: React.ReactNode
  className?: string
  animationDelay?: number
  glowColor?: "cyan" | "blue" | "green"
  position?: "left" | "right" | "top" | "bottom"
}

export function FloatingHUDPanel({
  title,
  children,
  className,
  animationDelay = 0,
  glowColor = "cyan",
  position = "left"
}: FloatingHUDPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay)
    return () => clearTimeout(timer)
  }, [animationDelay])

  const glowStyles = {
    cyan: "border-cyan-400/30 shadow-[0_0_30px_rgba(0,200,255,0.3)]",
    blue: "border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    green: "border-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
  }

  const positionAnimation = {
    left: "animate-float-panel-1",
    right: "animate-float-panel-2",
    top: "animate-float-panel-3",
    bottom: "animate-float-slow"
  }

  return (
    <div
      className={cn(
        "glass-panel rounded-lg overflow-hidden transition-all duration-1000",
        glowStyles[glowColor],
        positionAnimation[position],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
      style={{
        transitionDelay: `${animationDelay}ms`
      }}
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-4 h-[2px] bg-cyan-400" />
        <div className="absolute top-0 left-0 h-4 w-[2px] bg-cyan-400" />
      </div>
      <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 right-0 w-4 h-[2px] bg-cyan-400" />
        <div className="absolute top-0 right-0 h-4 w-[2px] bg-cyan-400" />
      </div>
      <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-4 h-[2px] bg-cyan-400" />
        <div className="absolute bottom-0 left-0 h-4 w-[2px] bg-cyan-400" />
      </div>
      <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-cyan-400" />
        <div className="absolute bottom-0 right-0 h-4 w-[2px] bg-cyan-400" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-400/20 bg-cyan-950/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
            <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
          </div>
          <span className="font-mono text-xs font-semibold text-cyan-300 tracking-wider">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-cyan-400/60">LIVE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative">
        {/* Scanline effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline" />
        </div>
        {children}
      </div>
    </div>
  )
}
