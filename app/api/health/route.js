/**
 * AgentMesh Next.js API Route — /api/health
 */
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    status:    'online',
    version:   '1.0.0-hackathon',
    network:   'avalanche-fuji',
    chainId:   43113,
    timestamp: new Date().toISOString(),
  })
}
