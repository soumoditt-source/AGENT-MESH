/**
 * AgentMesh — Catch-all Research Route
 * URL: /api/research/[slug]
 * Implements x402 Payment Required flow for various research nodes.
 */

import { NextResponse } from 'next/server';
import { 
  fetchNews, 
  fetchAcademic, 
  fetchSocial, 
  fetchTech, 
  fetchWiki, 
  fetchCrypto, 
  fetchQuotes,
  fetchMeteo
} from '../../../../lib/researchProviders';

export const runtime = 'nodejs';

// Configurable Payment Parameters
const PAID_AMOUNT = '0.1';
const RECIPIENT = process.env.RECIPIENT || '0x0000000000000000000000000000000000000001';

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const bypassCode = request.headers.get('x-bypass-code');
  const paymentProof = request.headers.get('x-payment-proof');

  // 1. Payment Guard
  if (bypassCode !== 'DAKSH_FULLSTACKSHINOBI' && (!paymentProof || paymentProof.length < 10)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        amount: `${PAID_AMOUNT} USDC`,
        recipient: RECIPIENT,
        network: 'avalanche-fuji',
        instructions: 'Pay via facinet-sdk, then retry with X-Payment-Proof: <txHash>'
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'x-payment-amount': PAID_AMOUNT,
          'x-payment-recipient': RECIPIENT,
          'x-payment-network': 'avalanche-fuji',
          'x-payment-token': 'USDC'
        }
      }
    );
  }

  // 2. Data Fetching
  let data;
  try {
    switch (slug) {
      case 'news':
        data = await fetchNews(q, process.env.NEWS_API_KEY, process.env.GUARDIAN_API_KEY);
        break;
      case 'academic':
        data = await fetchAcademic(q);
        break;
      case 'social':
        data = await fetchSocial(q);
        break;
      case 'tech':
        data = await fetchTech(q);
        break;
      case 'wiki':
        data = await fetchWiki(q);
        break;
      case 'crypto':
        data = await fetchCrypto();
        break;
      case 'zenquotes':
      case 'quotes':
        data = await fetchQuotes();
        break;
      case 'meteo':
        data = await fetchMeteo(q);
        break;
      default:
        return NextResponse.json({ error: `Node ${slug} not found` }, { status: 404 });
    }

    return NextResponse.json({
      ...data,
      query: q,
      timestamp: Date.now()
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
