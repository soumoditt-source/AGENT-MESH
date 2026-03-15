"use client"

import React, { useState, useEffect } from 'react'
import { Activity, ShieldCheck, Globe, Cpu, ExternalLink } from 'lucide-react'

export function SystemStatusDashboard() {
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString())
    const interval = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(interval)
  }, [])

  const StatusItem = ({ icon: Icon, label, status, subtext, color, link }: any) => (
    <div className="flex items-center gap-4 p-3 bg-cyan-400/5 border border-cyan-400/10 rounded-lg hover:bg-cyan-400/10 transition-all group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${color.bg} ${color.border} ${color.glow}`}>
        <Icon className={`h-5 w-5 ${color.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-cyan-400/60 tracking-wider uppercase">{label}</span>
          <span className={`font-mono text-[10px] uppercase font-bold ${color.text}`}>{status}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="font-mono text-sm text-foreground truncate">{subtext}</span>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400/40 hover:text-cyan-400 transition-colors">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-widest uppercase">Live System Telemetry</span>
        </div>
        <span className="font-mono text-[10px] text-cyan-400/40">{timestamp}</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <StatusItem 
          icon={ShieldCheck}
          label="x402 Protocol"
          status="Operational"
          subtext="HTTP-402 Gateway Active"
          color={{
            bg: "bg-green-400/10",
            border: "border-green-400/30",
            text: "text-green-400",
            glow: "shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          }}
        />
        
        <StatusItem 
          icon={Globe}
          label="Blockchain"
          status="Connected"
          subtext="Avalanche Fuji (43113)"
          link="https://testnet.snowtrace.io/"
          color={{
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/30",
            text: "text-cyan-400",
            glow: "shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          }}
        />

        <StatusItem 
          icon={Cpu}
          label="AI Model"
          status="Synced"
          subtext="Gemini 3.1 Pro (Master)"
          color={{
            bg: "bg-blue-400/10",
            border: "border-blue-400/30",
            text: "text-blue-400",
            glow: "shadow-[0_0_10px_rgba(96,165,250,0.2)]"
          }}
        />
      </div>

      <div className="pt-2">
        <div className="h-1 w-full bg-cyan-900/20 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 animate-[progress_5s_ease-in-out_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  )
}
