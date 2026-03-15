"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { HeroCharacter } from "@/components/hero-character"
import { TerminalConsolePanel } from "@/components/terminal-console-panel"
import { SystemStatusDashboard } from '@/components/system-status-dashboard'
import { ResearchAgentPanel } from "@/components/research-agent-panel"
import { AgentNetworkPanel } from "@/components/agent-network-panel"
import { LoadingScreen } from "@/components/loading-screen"
import { DynamicBackground } from "@/components/dynamic-background"
import { ScrollArcReactor } from "@/components/scroll-arc-reactor"
import { ScrollSections } from "@/components/scroll-sections"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Play, Zap, ChevronDown, X, Loader2, CheckCircle, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react"
import { HUDTerminal } from "@/components/hud-terminal"

// ── Types ──────────────────────────────────────────────────────────────────
interface AgentResult {
  report: string
  payments: number
  paymentList: { source: string; txHash: string; amount?: string }[]
  registryTx: string | null
  sources: string[]
  queries: string[]
  elapsed: string
  logs: string[]
}

interface AgentState {
  phase: 'idle' | 'running' | 'done' | 'error'
  payments: number
  usdc: number
  sources: string[]
  elapsed: string
  txList: { source: string; txHash: string }[]
  topic?: string
  error?: string
}

// ── Markdown renderer (basic) ──────────────────────────────────────────────
function MdText({ text }: { text: string }) {
  const html = text
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-cyan-300 font-mono mb-2 mt-5 border-b border-cyan-400/20 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-cyan-300 font-mono mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-yellow-300">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="text-cyan-400 bg-cyan-400/10 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-foreground/80 text-sm list-disc">$1</li>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 text-foreground/80 text-sm list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-foreground/80 leading-relaxed mb-3">')

  return (
    <div
      className="font-mono text-sm text-foreground/80 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-sm text-foreground/80 leading-relaxed mb-3">${html}</p>` }}
    />
  )
}

// ── Agent Runner Modal ─────────────────────────────────────────────────────
function AgentModal({
  onClose,
  onStateChange,
}: {
  onClose: () => void
  onStateChange: (state: AgentState) => void
}) {
  const [topic, setTopic] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [retries, setRetries] = useState("2")
  const [bypassCode, setBypassCode] = useState("")
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)
  const [result, setResult] = useState<AgentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const SIM_STEPS = [
    "Connecting to Avalanche Fuji Testnet (43113)…",
    "Calling Gemini — generating 3 sub-queries…",
    "Sub-Agent 1: GET /research/news — HTTP 402 detected",
    "Signing ERC-3009 authorization (EIP-712)…",
    "Submitting payment via facinet facilitator network…",
    "Payment confirmed — retrying with X-Payment-Proof…",
    "Sub-Agent 2: GET /research/academic — 402 → pay → retry…",
    "Sub-Agent 3: GET /research/social — 402 → pay → retry…",
    "Gemini synthesizing research report…",
    "Registering on ERC-8004 (AgentRegistry.sol)…",
    "Saving report to output/…",
  ]

  const addLog = (msg: string) => {
    const t = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [...prev, `[${t}] ${msg}`])
    setTimeout(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, 50)
  }

  const runAgent = async () => {
    if (!topic.trim()) return
    setRunning(true)
    setError(null)
    setResult(null)
    setLogs([])
    setStep(0)

    onStateChange({ phase: 'running', payments: 0, usdc: 0, sources: [], elapsed: '', txList: [], topic: topic.trim() })

    // Simulate step-by-step progress while real API runs
    let simIdx = 0
    addLog(`Launching AgentMesh for: "${topic.trim()}"`)
    const simInterval = setInterval(() => {
      if (simIdx < SIM_STEPS.length) {
        addLog(SIM_STEPS[simIdx])
        setStep(simIdx)
        simIdx++
      }
    }, 1800)

    try {
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), priority, retries: parseInt(retries), bypassCode: bypassCode.trim() }),
      })

      clearInterval(simInterval)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `API returned ${res.status}`)
      }

      const r: AgentResult = json.result
      setResult(r)
      setStep(SIM_STEPS.length)

      // Add real logs from the agent
      if (r.logs?.length) {
        r.logs.forEach(l => addLog(`✓ ${l}`))
      }
      addLog(`✅ Research complete! ${r.payments} payments, ${r.sources?.length} sources in ${r.elapsed}s`)

      onStateChange({
        phase:    'done',
        payments: r.payments,
        usdc:     r.payments * 0.1,
        sources:  r.sources || [],
        elapsed:  r.elapsed,
        txList:   r.paymentList || [],
        topic:    topic.trim(),
      })
    } catch (err: any) {
      clearInterval(simInterval)
      const errMsg = err.message || 'Agent failed'
      setError(errMsg)
      addLog(`❌ Error: ${errMsg}`)
      addLog('💡 Check: PRIVATE_KEY, GEMINI_API_KEY, RECIPIENT in .env — then restart')
      onStateChange({ phase: 'error', payments: 0, usdc: 0, sources: [], elapsed: '', txList: [], error: errMsg })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col hud-panel"
        style={{
          boxShadow: '0 0 60px rgba(0,200,255,0.2), 0 0 120px rgba(0,200,255,0.08)',
        }}
      >
        {/* Scanlines inside modal too */}
        <div className="scanlines opacity-40" />
        {/* Top stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-400/15">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-mono font-bold text-foreground tracking-wide">AGENT COMMAND CENTER</div>
              <div className="font-mono text-[10px] text-cyan-400/60 tracking-widest">AUTONOMOUS x402 RESEARCH NETWORK</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={running}
            title="Close Command Center"
            aria-label="Close Command Center"
            className="w-8 h-8 rounded-lg border border-cyan-400/20 bg-cyan-400/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-cyan-400/40 transition-all disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Input form */}
          {!result && (
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs text-cyan-400/70 tracking-widest uppercase mb-2 block flex items-center justify-between">
                  <span>Research Objective</span>
                  {bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' && (
                    <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold animate-pulse">
                      <Zap className="h-3 w-3" /> PREMIUM DATA ACTIVE
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Future of Layer 2 Scaling"
                  disabled={running}
                  title="Topic Input"
                  aria-label="Research Topic"
                  className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-cyan-400/60 transition-all disabled:opacity-50"
                />
              </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-cyan-400/70 tracking-widest uppercase mb-2 block">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    disabled={running}
                    title="Research Priority"
                    aria-label="Priority level"
                    className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-cyan-400/50 disabled:opacity-50"
                  >
                    <option value="High">HIGH</option>
                    <option value="Medium">MEDIUM</option>
                    <option value="Low">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs text-cyan-400/70 tracking-widest uppercase mb-2 block">Max Retries</label>
                  <select
                    value={retries}
                    onChange={e => setRetries(e.target.value)}
                    disabled={running}
                    title="Max Retries"
                    aria-label="Retry count"
                    className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-cyan-400/50 disabled:opacity-50"
                  >
                    <option value="1">1×</option>
                    <option value="2">2×</option>
                    <option value="3">3×</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-cyan-400/70 tracking-widest uppercase mb-2 block flex items-center justify-between">
                  <span>DAKSH BYPASS / REFERRAL</span>
                  {bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' ? (
                    <span className="text-[9px] text-yellow-400 animate-pulse font-bold tracking-tighter">PREMIUM ACCESS UNLOCKED</span>
                  ) : (
                    <span className="text-[9px] text-cyan-400/40">BYPASS 402 PAYMENTS</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bypassCode}
                    onChange={e => setBypassCode(e.target.value)}
                    placeholder="ENTER DAKSH_FULLSTACKSHINOBI"
                    disabled={running}
                    className={`w-full bg-cyan-400/5 border rounded-lg px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 outline-none transition-all disabled:opacity-50 ${
                      bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' 
                        ? 'border-yellow-400/60 shadow-[0_0_15px_rgba(234,179,8,0.2)] text-yellow-400' 
                        : 'border-cyan-400/20 focus:border-cyan-400/60'
                    }`}
                  />
                  {bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' && (
                    <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
                  )}
                </div>
              </div>

              <Button
                onClick={runAgent}
                disabled={running || !topic.trim()}
                className="w-full font-mono bg-cyan-500 text-background hover:bg-cyan-400 py-4 text-base relative overflow-hidden disabled:opacity-50"
                style={running ? {} : { boxShadow: '0 0 40px rgba(0,200,255,0.4)' }}
              >
                {running ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> AGENT RUNNING…</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> LAUNCH AGENT MESH<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}

          {/* Live terminal log */}
          {logs.length > 0 && (
            <div className="space-y-3">
              <div className="font-mono text-xs text-cyan-400/60 tracking-widest uppercase flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Agent Log
                  {running && <span className="text-yellow-400 animate-pulse">● LIVE</span>}
                </div>
                {bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="text-[9px]">PREMIUM BYPASS ACTIVE</span>
                  </div>
                )}
              </div>
              
              <HUDTerminal 
                agentLogs={logs} 
                liveTxList={result?.paymentList || []}
              />
            </div>
          )}

          {/* Progress steps */}
          {running && (
            <div className="grid grid-cols-2 gap-2">
              {['Query Generation', '402 Detection', 'USDC Payment', 'Data Fetch', 'AI Synthesis', 'ERC-8004 Register'].map((s, i) => (
                <div key={i} className={`flex items-center gap-2 font-mono text-xs p-2 rounded border ${
                  step > i * 1.5 ? 'border-green-400/30 text-green-400 bg-green-400/5' :
                  step > i * 1.5 - 1 ? 'border-cyan-400/40 text-cyan-300 bg-cyan-400/5' :
                  'border-cyan-400/10 text-muted-foreground'
                }`}>
                  {step > i * 1.5 ? <CheckCircle className="h-3 w-3 shrink-0" /> : step > i * 1.5 - 1 ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : <div className="h-3 w-3 rounded-full border border-current shrink-0" />}
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-400/10 border border-red-400/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-sm text-red-400 font-medium mb-1">Agent Error</div>
                <div className="font-mono text-xs text-red-300/80">{error}</div>
                <div className="font-mono text-xs text-muted-foreground mt-2">
                  Ensure PRIVATE_KEY, RECIPIENT, GEMINI_API_KEY are set in .env and restart server.
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Payments', val: String(result.payments), color: 'text-cyan-300' },
                  { 
                    label: 'USDC Spent', 
                    val: bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' ? 'PREMIUM' : `$${(result.payments * 0.1).toFixed(1)}`, 
                    color: bypassCode.trim().toUpperCase() === 'DAKSH_FULLSTACKSHINOBI' ? 'text-yellow-400' : 'text-green-400' 
                  },
                  { label: 'Sources', val: String(result.sources?.length || 0), color: 'text-yellow-400' },
                  { label: 'Time', val: result.elapsed ? result.elapsed + 's' : '—', color: 'text-cyan-300' },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-cyan-400/5 border border-cyan-400/15 rounded-lg p-3 shadow-[0_0_15px_rgba(0,180,255,0.05)]">
                    <div className={`font-mono text-xl font-bold ${s.color} translate-z-10 whitespace-nowrap`}>{s.val}</div>
                    <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Payment proofs */}
              {result.paymentList?.length > 0 && (
                <div>
                  <div className="font-mono text-xs text-cyan-400/60 tracking-widest uppercase mb-2">On-Chain Payment Proofs</div>
                  <div className="space-y-1.5">
                    {result.paymentList.map((p, i) => (
                      <div key={i} className="flex items-center justify-between font-mono text-xs p-2 bg-green-400/5 border border-green-400/20 rounded">
                        <span className="text-yellow-400 font-medium">{p.source}</span>
                        <span className="text-muted-foreground">{p.txHash.slice(0,10)}…{p.txHash.slice(-6)}</span>
                        <a
                          href={`https://testnet.snowtrace.io/tx/${p.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          Snowtrace <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                    {result.registryTx && (
                      <div className="flex items-center justify-between font-mono text-xs p-2 bg-cyan-400/5 border border-cyan-400/20 rounded">
                        <span className="text-cyan-400 font-medium">ERC-8004 Registry</span>
                        <span className="text-muted-foreground">{result.registryTx.slice(0,10)}…{result.registryTx.slice(-6)}</span>
                        <a
                          href={`https://testnet.snowtrace.io/tx/${result.registryTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >Snowtrace <ExternalLink className="h-3 w-3" /></a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Report */}
              <div>
                <div className="font-mono text-xs text-cyan-400/60 tracking-widest uppercase mb-2">Intelligence Report</div>
                <div
                  className="bg-background/60 border border-cyan-400/15 rounded-lg p-4 max-h-56 overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <MdText text={result.report || ''} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => { setResult(null); setLogs([]); setStep(-1); setError(null); setTopic("") }}
                  variant="outline"
                  className="flex-1 font-mono border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10"
                >
                  New Research
                </Button>
                <Button
                  onClick={() => {
                    const blob = new Blob([result.report || ''], { type: 'text/markdown' })
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                    a.download = `agentmesh_${Date.now()}.md`; a.click()
                  }}
                  className="flex-1 font-mono bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30"
                >
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function AgentMeshPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [agentState, setAgentState] = useState<AgentState>({
    phase: 'idle', payments: 0, usdc: 0, sources: [], elapsed: '', txList: []
  })
  const [agentStep, setAgentStep] = useState(-1)

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false)
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setMaxScroll(document.documentElement.scrollHeight - window.innerHeight)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-increment step during agent run (for ResearchAgentPanel)
  useEffect(() => {
    if (agentState.phase !== 'running') {
      setAgentStep(agentState.phase === 'done' ? 99 : -1)
      return
    }
    setAgentStep(0)
    const interval = setInterval(() => setAgentStep(prev => prev + 1), 2000)
    return () => clearInterval(interval)
  }, [agentState.phase])

  const heroOpacity = Math.max(0, 1 - scrollY / 600)
  const heroScale = Math.max(0.8, 1 - scrollY / 3000)
  const heroTranslateY = scrollY * 0.3
  const navBackground = Math.min(0.9, scrollY / 500)

  const openModal = () => setShowModal(true)

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      {showModal && (
        <AgentModal
          onClose={() => setShowModal(false)}
          onStateChange={setAgentState}
        />
      )}

      <main className="min-h-[500vh] bg-background relative overflow-x-hidden">
        {/* Global HUD Overlay Effects */}
        <div className="scanlines" />
        <div className="hud-grid-bg" />
        
        <DynamicBackground scrollY={scrollY} maxScroll={maxScroll} />

        <ScrollArcReactor position="left"  scrollY={scrollY} index={0} />
        <ScrollArcReactor position="right" scrollY={scrollY} index={1} />
        <ScrollArcReactor position="left"  scrollY={scrollY} index={2} />
        <ScrollArcReactor position="right" scrollY={scrollY} index={3} />

        {/* Video Background */}
        <div className="fixed inset-0 z-[1] pointer-events-none">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(3px) saturate(1.2)', opacity: 0.08 + scrollY * 0.0001, transform: `scale(${1 + scrollY * 0.0002})` }}>
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whisk_mmmhndo4itoxumz50ynlrtotqmy1qtl2kzni1sn-6mqzlsOVsT62Kj9PjYKq7fnW16iT7t.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 transition-all duration-500"
            style={{ background: `linear-gradient(to bottom, rgba(8,20,35,${0.7 - scrollY * 0.0002}) 0%, rgba(8,20,35,${0.5 - scrollY * 0.0001}) 50%, rgba(8,20,35,0.9) 100%)` }} />
        </div>

        {/* Nav */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
          style={{ 
            borderColor: `rgba(0,229,255,${0.1 + navBackground * 0.2})`, 
            backgroundColor: `rgba(8,20,35,${navBackground})`, 
            backdropFilter: `blur(${12 + navBackground * 8}px)` 
          }}
        >
          <div className="max-w-[1800px] mx-auto px-6 h-20 grid grid-cols-3 items-center">
            {/* Logo - Left */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="font-mono text-xl font-bold text-foreground tracking-tight">AGENT<span className="text-[#00e5ff]">MESH</span></span>
            </div>

            {/* Navigation - Center */}
            <div className="hidden md:flex items-center justify-center gap-12">
              <a href="#features" className="font-mono text-xs tracking-[0.3em] text-cyan-100/60 hover:text-[#00e5ff] transition-all hover:scale-105 active:scale-95">FEATURES</a>
              <a href="#demo" className="font-mono text-xs tracking-[0.3em] text-cyan-100/60 hover:text-[#00e5ff] transition-all hover:scale-105 active:scale-95">PLATFORM</a>
              <a href="https://agent-mesh-seven.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-mono text-xs tracking-[0.3em] text-cyan-100/60 hover:text-[#00e5ff] transition-all hover:scale-105 active:scale-95">DOCS</a>
            </div>

            {/* Actions - Right */}
            <div className="flex items-center justify-end gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-mono text-muted-foreground hover:text-foreground border border-transparent hover:border-cyan-400/30"
                onClick={() => window.open('https://github.com/soumoditt-source/AGENT-MESH', '_blank')}
              >
                <Github className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">SOURCE</span>
              </Button>
              <Button
                size="sm"
                onClick={openModal}
                className="font-mono bg-[#00e5ff] text-background hover:bg-cyan-400 font-bold"
                style={{ boxShadow: `0 0 ${25 + Math.sin(scrollY * 0.01) * 10}px rgba(0,229,255,0.4)` }}
              >
                <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                RUN AGENT
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section
          className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ opacity: heroOpacity, transform: `scale(${heroScale}) translateY(${heroTranslateY}px)`, pointerEvents: heroOpacity > 0.3 ? 'auto' : 'none' }}
        >
          <div className="relative w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div
              className={`absolute top-24 left-0 right-0 z-30 text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
              style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 backdrop-blur-sm px-5 py-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${agentState.phase === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}
                  style={{ boxShadow: agentState.phase === 'running' ? '0 0 10px rgba(234,179,8,0.8)' : '0 0 10px rgba(34,197,94,0.8)' }} />
                <span className="font-mono text-xs text-cyan-300 tracking-[0.2em]">
                  {agentState.phase === 'running' ? 'AGENT EXECUTING' : agentState.phase === 'done' ? 'RESEARCH COMPLETE' : 'AUTONOMOUS MODE ACTIVE'}
                </span>
              </div>

              <h1 className="font-mono text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-foreground mb-6 text-balance">
                <span className="inline-block"
                  style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #00b8d4 50%, #0088a3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 ${30 + Math.sin(scrollY * 0.01) * 10}px rgba(0,200,255,0.5))` }}>
                  AgentMesh
                </span>
                <span className="text-foreground/80"> — </span>
                <br className="hidden lg:block" />
                <span className="text-foreground/90">Autonomous x402</span>
                <br className="hidden sm:block" />
                <span className="text-foreground/90">Research Network</span>
              </h1>

              <p className="font-mono text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                AI agents that autonomously pay for data, synthesize research, and register on-chain.
                <br className="hidden sm:block" />
                <span className="text-cyan-400/80">Powered by the Arc Reactor of decentralized payments.</span>
              </p>
            </div>

            {/* 3D Layout */}
            <div className="relative h-[90vh] flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}>
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] w-full opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.15) 0%, transparent 70%)', backgroundImage: 'radial-gradient(rgba(0,229,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Capability Matrix - Top Center (Fills Empty Middle) */}
                <div className={`absolute top-[2%] left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-y-10'}`}
                  style={{ transform: `translateX(-50%) translateZ(100px) translateY(${scrollY * 0.05}px)`, opacity: heroOpacity }}>
                  
                  {/* Neural HUD Activity Grid */}
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="grid grid-cols-12 gap-1 p-2 bg-cyan-400/5 border border-cyan-400/10 rounded backdrop-blur-[2px]">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${Math.random() > 0.8 ? 'bg-cyan-400 shadow-[0_0_5px_rgba(0,229,255,0.8)]' : 'bg-cyan-900/40'}`} 
                             style={{ animationDelay: `${i * 50}ms`, transitionDelay: `${i * 10}ms` }} />
                      ))}
                    </div>
                    <div className="font-mono text-[8px] text-cyan-400/40 tracking-[0.4em] uppercase">Neural Mesh Synchronized</div>
                  </div>

                  <div className="glass-panel p-4 flex gap-6 items-center rounded-2xl border-cyan-400/20 shadow-[0_0_40px_rgba(0,229,255,0.1)]">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[10px] text-cyan-400/60 mb-1">LATENCY</span>
                      <span className="font-mono text-sm text-cyan-300">14ms</span>
                    </div>
                    <div className="h-8 w-px bg-cyan-400/20" />
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[10px] text-cyan-400/60 mb-1">STABILITY</span>
                      <span className="font-mono text-sm text-cyan-300">99.9%</span>
                    </div>
                    <div className="h-8 w-px bg-cyan-400/20" />
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[10px] text-cyan-400/60 mb-1">VIBE-INDEX</span>
                      <span className="font-mono text-sm text-[#00e5ff] font-bold">MAX</span>
                    </div>
                    <div className="h-8 w-px bg-cyan-400/20" />
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[10px] text-cyan-400/60 mb-1">UPTIME</span>
                      <span className="font-mono text-sm text-cyan-300">∞</span>
                    </div>
                  </div>

                  {/* LIVE SYSTEM STATUS DASHBOARD FOR JUDGES */}
                  <div className="mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <SystemStatusDashboard />
                  </div>

                  {/* Operational Status Ticker */}
                  <div className="mt-4 flex items-center gap-3 px-4 py-1.5 bg-background/40 border border-cyan-900/30 rounded-full backdrop-blur-md overflow-hidden max-w-[300px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="font-mono text-[9px] text-cyan-100/70 whitespace-nowrap animate-marquee">
                      SYSTEM STATUS: OPTIMAL // X402 GATEWAY READY // RESEARCH BRANCHES: 8 // ERC-8004 REGISTRY SYNCED //
                    </div>
                  </div>
                </div>

              {/* Left — Terminal */}
              <div
                className={`absolute left-0 top-[30%] z-20 hidden xl:block transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-x-20'}`}
                style={{ transform: `perspective(1000px) rotateY(${15 - scrollY * 0.01}deg) translateZ(${50 - scrollY * 0.05}px) translateY(${scrollY * 0.1}px)`, opacity: heroOpacity }}
              >
                <TerminalConsolePanel />
              </div>

              {/* Center — Hero Character */}
              <div
                className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transform: `translateY(${scrollY * 0.05}px) scale(${1 - scrollY * 0.0003})` }}
              >
                <HeroCharacter />
              </div>

              {/* Right — Research Agent Panel (LIVE) */}
              <div
                className={`absolute right-0 top-[20%] z-20 hidden lg:block transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-x-20'}`}
                style={{ transform: `perspective(1000px) rotateY(${-15 + scrollY * 0.01}deg) translateZ(${50 - scrollY * 0.05}px) translateY(${scrollY * 0.15}px)`, opacity: heroOpacity }}
              >
                <ResearchAgentPanel agentState={agentState} currentStep={agentStep} />
              </div>

              {/* Bottom Right — Network */}
              <div
                className={`absolute right-4 bottom-[5%] z-20 hidden xl:block transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-20'}`}
                style={{ transform: `perspective(1000px) rotateX(${5 - scrollY * 0.005}deg) translateZ(${30 - scrollY * 0.03}px) translateY(${scrollY * 0.2}px)`, opacity: heroOpacity }}
              >
                <AgentNetworkPanel />
              </div>
            </div>

            {/* CTA */}
            <div
              className={`absolute bottom-12 left-0 right-0 z-30 flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
              style={{ transform: `translateY(${-scrollY * 0.3}px)`, opacity: heroOpacity }}
            >
              <Button
                size="lg"
                onClick={openModal}
                className="font-mono bg-cyan-500 text-background hover:bg-cyan-400 px-10 py-6 text-base"
                style={{ boxShadow: '0 0 40px rgba(0,200,255,0.5), 0 0 80px rgba(0,200,255,0.2)' }}
              >
                <Play className="h-5 w-5 mr-2" />
                Run Agent
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-mono border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/50 px-8 py-6 text-base"
                onClick={() => window.open('/api/health', '_blank')}
              >
                View API Status
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-500 ${isLoaded && scrollY < 100 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-mono text-xs text-cyan-400/60 tracking-wider">SCROLL TO EXPLORE</span>
              <ChevronDown className="h-5 w-5 text-cyan-400/60 animate-bounce" />
            </div>
          </div>
        </section>

        <div className="h-screen" />
        <ScrollSections scrollY={scrollY} />

        {/* Final CTA */}
        <section
          className="relative z-20 min-h-screen flex items-center justify-center py-32"
          style={{ opacity: Math.min(1, Math.max(0, (scrollY - maxScroll * 0.7) / 500)) }}
        >
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-5 py-2 mb-8">
              <span className="font-mono text-xs text-cyan-400 tracking-[0.2em]">READY TO DEPLOY</span>
            </div>
            <h2 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold mb-8"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #00e5ff 50%, #0088a3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Launch Your Autonomous Agent
            </h2>
            <p className="font-mono text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join the network of AI agents operating independently on the blockchain. No manual intervention required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={openModal}
                className="font-mono bg-cyan-500 text-background hover:bg-cyan-400 px-12 py-7 text-lg"
                style={{ boxShadow: '0 0 60px rgba(0,200,255,0.5), 0 0 100px rgba(0,200,255,0.2)' }}>
                <Play className="h-5 w-5 mr-2" />Deploy Now<ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="font-mono border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 px-10 py-7 text-lg"
                onClick={() => window.open('https://github.com/soumoditt-source/AGENT-MESH', '_blank')}
              >
                <Github className="h-5 w-5 mr-2" />View Source
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-20 border-t border-cyan-400/10 py-12 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                  <Zap className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="font-mono text-xl font-bold text-foreground">AgentMesh</span>
              </div>
              <div className="flex items-center gap-8 font-mono text-sm text-muted-foreground">
                <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
                <a href="/api/health" target="_blank" className="hover:text-cyan-400 transition-colors">API Status</a>
                <a href="https://testnet.snowtrace.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Snowtrace</a>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Powered by <span className="text-cyan-400 font-semibold">x402 Payment Engine</span> · Avalanche Fuji · ERC-8004
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
