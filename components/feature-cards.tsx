"use client"

import { Bot, Zap, Shield, Network, Wallet, Globe } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "JARVIS-Class AI",
    description: "Autonomous decision-making engine capable of executing complex financial operations without human intervention.",
    stat: "99.9% uptime"
  },
  {
    icon: Zap,
    title: "x402 Payment Engine",
    description: "The Arc Reactor of autonomous payments. Powers instant, trustless transactions across the AgentMesh network.",
    stat: "Sub-second finality"
  },
  {
    icon: Shield,
    title: "On-Chain Identity",
    description: "Self-sovereign digital presence. Your agent registers and verifies its identity directly on the blockchain.",
    stat: "Immutable identity"
  },
  {
    icon: Network,
    title: "AgentMesh Network",
    description: "Interconnected mesh of autonomous agents collaborating to execute tasks and manage distributed operations.",
    stat: "10K+ active agents"
  },
  {
    icon: Wallet,
    title: "Autonomous Finance",
    description: "Pay bills, manage subscriptions, and handle financial tasks automatically. Set rules and let the AI execute.",
    stat: "$2.4M processed"
  },
  {
    icon: Globe,
    title: "Decentralized Operations",
    description: "No single point of failure. Your agent operates across distributed infrastructure with built-in redundancy.",
    stat: "Global coverage"
  }
]

export function FeatureCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, i) => (
        <div 
          key={i}
          className="group relative overflow-hidden rounded-lg border border-primary/20 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          
          {/* Corner accent */}
          <div className="absolute right-0 top-0 h-16 w-16">
            <div className="absolute right-0 top-0 h-px w-8 bg-primary/50" />
            <div className="absolute right-0 top-0 h-8 w-px bg-primary/50" />
          </div>
          
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-mono text-xs text-primary">{feature.stat}</span>
            </div>
            
            <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
