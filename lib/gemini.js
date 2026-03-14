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
  // 1. Primary: Gemini 3.1 Pro
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
      },
      // New Gemini 3.1 Thinking Configuration
      thinkingConfig: {
        thinking_level: level === 'high' ? 'high' : 'low'
      }
    });
    return (await result.response).text();
  } catch (e) {
    console.error(`[AI] Gemini 3.1 failed: ${e.message}. Trying OpenRouter...`);
  }

  // 2. Secondary: OpenRouter (DeepSeek Backup)
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error(data.error?.message || 'OpenRouter empty response');
  } catch (e) {
    console.error(`[AI] OpenRouter failed: ${e.message}. Trying Hugging Face...`);
  }

  // 3. Final Fallback: Hugging Face (Mistral/Llama)
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
    throw new Error('Multi-LLM failure: Gemini, OpenRouter, and Hugging Face are all unavailable.');
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
  // Truncate data string to avoid token limit
  let dataStr = JSON.stringify(allResults, null, 2);
  if (dataStr.length > 12000) dataStr = dataStr.slice(0, 12000) + '... [TRUNCATED]';

  const prompt = `You are an elite research analyst. Synthesize a comprehensive research report on: "${topic}"

Using this collected data from multiple sources:
${dataStr}

Write the report with these EXACT sections (use markdown headers):

## Executive Summary
2-3 sentences summarizing the key findings.

## Key Findings
5 bullet points with specific data points, numbers, or facts from the actual data.

## News Analysis
What is currently happening? Cite real headlines or article titles from the data.

## Academic Perspective
What does research say? Reference actual paper titles or arXiv entries if available.

## Public Sentiment
What are people discussing? Reference subreddits, scores, comment counts if available.

## Conclusion & Implications
2-3 sentences on what this means going forward.

Be specific, cite source names, include metrics where available.`;

  return await callLLM(prompt, 'high');
}
