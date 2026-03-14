"use client"

import { useRef } from "react"

interface ScrollSectionsProps {
  scrollY: number
}

export function ScrollSections({ scrollY }: ScrollSectionsProps) {
  const sections = [
    {
      id: 'payment-engine',
      title: 'x402 Payment Engine',
      subtitle: 'AUTONOMOUS FINANCIAL OPERATIONS',
      description: 'The Arc Reactor of decentralized payments. AI agents that pay for data, execute transactions, and manage finances without human intervention.',
      features: ['Real-time USDC transactions', 'Cross-chain settlement', 'Zero-knowledge proofs', 'Sub-second finality']
    },
    {
      id: 'agent-network',
      title: 'AgentMesh Network',
      subtitle: 'DISTRIBUTED INTELLIGENCE',
      description: 'A mesh of specialized AI agents working in concert. Research, market analysis, and execution nodes operating 24/7.',
      features: ['Multi-agent orchestration', 'Consensus protocols', 'Self-healing network', 'Dynamic load balancing']
    },
    {
      id: 'on-chain',
      title: 'On-Chain Identity',
      subtitle: 'SOVEREIGN PRESENCE',
      description: 'Self-registering blockchain identity. Agents that establish, verify, and maintain their own on-chain credentials.',
      features: ['DID resolution', 'Verifiable credentials', 'Reputation staking', 'Trust scoring']
    },
    {
      id: 'autonomy',
      title: 'True Autonomy',
      subtitle: 'JARVIS-CLASS INTELLIGENCE',
      description: 'Beyond automation. Agents that think, decide, and act independently while maintaining alignment with human values.',
      features: ['Goal-directed behavior', 'Resource optimization', 'Risk management', 'Continuous learning']
    }
  ]

  return (
    <div className="relative z-20">
      {sections.map((section, index) => {
        const sectionStart = (index + 1) * 800
        const sectionProgress = Math.max(0, Math.min(1, (scrollY - sectionStart + 400) / 600))
        const isVisible = scrollY > sectionStart - 400 && scrollY < sectionStart + 800
        
        return (
          <section
            key={section.id}
            className="min-h-screen flex items-center justify-center py-20 px-4"
            style={{
              opacity: isVisible ? sectionProgress : 0,
              transform: `translateY(${isVisible ? 0 : 100}px)`,
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
            }}
          >
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              {/* Content side */}
              <div 
                className={`${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
                style={{
                  transform: `translateX(${index % 2 === 0 ? -50 + sectionProgress * 50 : 50 - sectionProgress * 50}px)`,
                  opacity: sectionProgress
                }}
              >
                <div className="space-y-6">
                  <div className="inline-block">
                    <span className="font-mono text-xs tracking-[0.3em] text-cyan-400/80 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                      {section.subtitle}
                    </span>
                  </div>
                  
                  <h2 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #00c8ff 50%, #0088aa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none'
                    }}
                  >
                    {section.title}
                  </h2>
                  
                  <p className="text-lg text-foreground/70 leading-relaxed">
                    {section.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {section.features.map((feature, i) => (
                      <div 
                        key={i}
                        className="flex items-center gap-2 font-mono text-sm text-cyan-300/80"
                        style={{
                          opacity: Math.max(0, sectionProgress - i * 0.1),
                          transform: `translateX(${Math.max(0, 20 - sectionProgress * 20 - i * 5)}px)`,
                          transition: 'all 0.3s ease-out'
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,200,255,0.8)]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual side */}
              <div 
                className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
                style={{
                  transform: `
                    perspective(1000px)
                    rotateY(${index % 2 === 0 ? -10 + sectionProgress * 10 : 10 - sectionProgress * 10}deg)
                    rotateX(${5 - sectionProgress * 5}deg)
                    translateZ(${sectionProgress * 50}px)
                  `,
                  opacity: sectionProgress
                }}
              >
                <div 
                  className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,40,60,0.6) 0%, rgba(0,20,40,0.8) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,200,255,0.2)',
                    boxShadow: '0 0 40px rgba(0,200,255,0.15), inset 0 0 60px rgba(0,200,255,0.05)'
                  }}
                >
                  {/* HUD corners */}
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                    <div
                      key={corner}
                      className="absolute w-8 h-8"
                      style={{
                        top: corner.includes('top') ? '12px' : 'auto',
                        bottom: corner.includes('bottom') ? '12px' : 'auto',
                        left: corner.includes('left') ? '12px' : 'auto',
                        right: corner.includes('right') ? '12px' : 'auto',
                        borderTop: corner.includes('top') ? '2px solid rgba(0,200,255,0.5)' : 'none',
                        borderBottom: corner.includes('bottom') ? '2px solid rgba(0,200,255,0.5)' : 'none',
                        borderLeft: corner.includes('left') ? '2px solid rgba(0,200,255,0.5)' : 'none',
                        borderRight: corner.includes('right') ? '2px solid rgba(0,200,255,0.5)' : 'none',
                      }}
                    />
                  ))}

                  {/* Section visual content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SectionVisual type={section.id} progress={sectionProgress} />
                  </div>

                  {/* Scanning line */}
                  <div 
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    style={{
                      top: `${(sectionProgress * 100) % 100}%`,
                      opacity: 0.5,
                      boxShadow: '0 0 10px rgba(0,200,255,0.8)'
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function SectionVisual({ type, progress }: { type: string; progress: number }) {
  switch (type) {
    case 'payment-engine':
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Transaction flow visualization */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-cyan-400/50 via-cyan-300 to-cyan-400/50"
              style={{
                width: '60%',
                top: `${25 + i * 12}%`,
                left: '20%',
                transform: `scaleX(${progress})`,
                transformOrigin: 'left',
                opacity: progress > i * 0.2 ? 1 : 0,
                transition: 'all 0.3s ease-out'
              }}
            />
          ))}
          <div 
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,255,0.6) 0%, rgba(0,200,255,0.2) 50%, transparent 70%)',
              boxShadow: '0 0 60px rgba(0,200,255,0.5)',
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}
          />
          <span className="absolute font-mono text-2xl font-bold text-cyan-300" style={{ textShadow: '0 0 20px rgba(0,200,255,0.8)' }}>x402</span>
        </div>
      )

    case 'agent-network':
      return (
        <div className="relative w-full h-full">
          {/* Network nodes */}
          {[...Array(7)].map((_, i) => {
            const angle = (i / 7) * Math.PI * 2
            const radius = 80
            const x = 50 + Math.cos(angle) * radius / 2
            const y = 50 + Math.sin(angle) * radius / 2

            return (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-cyan-400"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 15px rgba(0,200,255,0.8)',
                  opacity: progress > i * 0.1 ? 1 : 0,
                  transition: 'opacity 0.3s ease-out'
                }}
              />
            )
          })}
          {/* Center hub */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-400/80"
            style={{
              boxShadow: '0 0 30px rgba(0,200,255,0.8), 0 0 60px rgba(0,200,255,0.4)',
              animation: 'pulse-glow 1.5s ease-in-out infinite'
            }}
          />
        </div>
      )

    case 'on-chain':
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Blockchain blocks */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 rounded-lg border-2 border-cyan-400/60 bg-cyan-400/10"
              style={{
                left: `${20 + i * 18}%`,
                top: '50%',
                transform: `translateY(-50%) translateX(${(1 - progress) * 50}px) rotateY(${progress * 15}deg)`,
                opacity: progress > i * 0.2 ? 0.8 : 0,
                boxShadow: '0 0 20px rgba(0,200,255,0.3)',
                transition: 'all 0.3s ease-out'
              }}
            >
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-cyan-300">
                {`0x${(i + 1).toString(16).padStart(2, '0')}`}
              </div>
            </div>
          ))}
        </div>
      )

    case 'autonomy':
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* AI brain visualization */}
          <div 
            className="relative w-32 h-32"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            {/* Neural connections */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                style={{
                  top: '50%',
                  transform: `rotate(${i * 22.5}deg)`,
                  opacity: progress,
                  animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`
                }}
              />
            ))}
            {/* Core */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(0,200,255,0.3) 60%, transparent 80%)',
                boxShadow: '0 0 40px rgba(0,200,255,0.6)',
                animation: 'pulse-glow 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      )

    default:
      return null
  }
}
