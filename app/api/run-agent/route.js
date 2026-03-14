/**
 * AgentMesh Next.js API Route — /api/run-agent
 * Bridges the Next.js frontend to the Node.js agent execution engine.
 * Uses `executeResearch` from lib/agentRunner.js (CommonJS-compatible import).
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for long agent runs

export async function POST(request) {
  try {
    const body = await request.json()
    const { topic, priority, retries, bypassCode } = body

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    // Dynamic import of the ESM agent runner (works in Node.js runtime)
    const { executeResearch } = await import('../../../lib/agentRunner.js')

    const logs = []
    const result = await executeResearch({
      topic:      topic.trim(),
      priority:   priority || 'Medium',
      maxRetries: retries !== undefined ? Math.min(Math.max(1, parseInt(retries, 10)), 5) : 2,
      bypassCode: bypassCode || '',
      log: (msg) => {
        logs.push(msg)
        console.log(`[AgentMesh] ${msg}`)
      }
    })

    return NextResponse.json({
      success: true,
      result:  { ...result, logs }
    })
  } catch (error) {
    console.error('[AgentMesh API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Agent execution failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status:      'AgentMesh API Live',
    description: 'POST with { topic, priority, retries } to run the research agent',
    endpoints:   ['/research/news', '/research/academic', '/research/social', '/research/tech', '/research/wiki', '/research/crypto'],
    network:     'avalanche-fuji',
  })
}
