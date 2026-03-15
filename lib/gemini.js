/**
 * AgentMesh — Gemini AI wrapper
 * generateSubQueries: breaks topic → 3 targeted search queries
 * synthesizeReport:  turns multi-source data → structured research report
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Common helper to call LLMs with fallback
 */
async function callLLM(prompt, level = 'high') {
  // 1. Primary: Gemini 3.1 Pro (The GOAT for Reasoning)
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4, // Lower temperature for more stable research structure
      }
    });
    const response = result.response;
    return response.text();
  } catch (e) {
    console.error(`[AI] Gemini 3.1 failed: ${e.message}. Trying Premium Claude Sonnet fallback...`);
  }

  // 2. Secondary: OpenRouter (Claude 3.5 Sonnet — Requested Highest Quality)
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentmesh.app', // Required by some OpenRouter models
        'X-Title': 'AgentMesh'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5
      })
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[AI] Claude 3.5 Sonnet (Premium) delivered the payload.');
      return data.choices[0].message.content;
    }
    throw new Error(data.error?.message || 'OpenRouter empty response');
  } catch (e) {
    console.error(`[AI] Claude 3.5 Sonnet failed: ${e.message}. Trying DeepSeek fallback...`);
    // Third Layer: DeepSeek (Fast & Cheap)
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    } catch (innerE) {
      console.error(`[AI] DeepSeek failed too: ${innerE.message}`);
    }
  }

  // 3. Final Emergency Fallback: Hugging Face (Mistral/Llama)
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });
    const result = await response.json();
    return Array.isArray(result) ? result[0].generated_text : result.generated_text;
  } catch (e) {
    console.error(`[AI] All providers failed: ${e.message}`);
    throw new Error('Multi-LLM failure: Gemini, Claude, DeepSeek, and Hugging Face are all unavailable.');
  }
}

/**
 * Generate exactly 3 targeted sub-queries from a research topic
 */
export async function generateSubQueries(topic) {
  const prompt = `You are a research strategist. For the topic: "${topic}"
Generate EXACTLY 3 specific, targeted search queries that together cover:
1. Current news and events
2. Academic or expert research
3. Public opinion or community discussion

Return ONLY the 3 queries, one per line, no numbering, no bullets, no explanation.
Keep each query 2-6 words, highly specific and actionable.`;

  const text = await callLLM(prompt, 'low');
  const queries = text.split('\n').map(q => q.trim()).filter(q => q.length > 3);
  return queries.slice(0, 3);
}

/**
 * Synthesize a structured research report from multi-source data
 */
export async function synthesizeReport(topic, allResults) {
  const validResults = allResults.filter(r => !r.error && Array.isArray(r.results) && r.results.length > 0);
  
  // 1. Data Sanitization & Truncation
  let dataStr = JSON.stringify(validResults, null, 2);
  if (dataStr.length > 15000) dataStr = dataStr.slice(0, 15000) + '... [TRUNCATED FOR STABILITY]';

  const prompt = `You are a Senior Research Director specializing in autonomous intelligence. Your mission is to synthesize a "Finest Quality" Intelligence Report on: "${topic}"

DATA INPUTS (Multi-Source Correlation):
${dataStr}

REPORT REQUIREMENTS:
- Use a highly professional, clinical, and expert tone (e.g., "Preliminary analysis suggests...", "Correlated data indicates...").

## 🌤️ Environmental & Location Intelligence (Meteo)
Correlate weather data from Open-Meteo with the research topic or provide it as "Current Operating Conditions" for the researched entity. Mention specific temperatures or windspeeds.

## ⚖️ Strategic Implications & Recommendations
2-3 paragraphs on the future trajectory and expert actionable advice.

## 🛡️ Resilience Metadata
This report was synthesized using the Multi-LLM AgentMesh Fallback Chain for maximum reliability.

Final Instruction: Be verbose where data allows, but stay objective. The report must be a comprehensive 800-1200 word clinical intelligence briefing.`;

  return await callLLM(prompt, 'high');
}
