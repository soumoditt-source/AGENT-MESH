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
    const response = await result.response;
    return response.text();
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

  const prompt = `You are a Senior Research Director specializing in autonomous intelligence. Your mission is to synthesize a "Finest Quality" Intelligence Report on: "${topic}"

DATA INPUTS (Multi-Source):
${dataStr}

REPORT REQUIREMENTS:
- Use a highly professional, clinical, and expert tone.
- CRITICAL: Cite real headlines, subreddit names, arxiv paper IDs, and coin metrics from the actual data provided above.
- If data is missing for a section, provide a strategic "Data Gap Analysis" explaining what is needed.
- Format strictly with the markdown headers below.

## 🏛️ Executive Summary
Synthesize 3-4 compelling sentences that distill the "big picture". Why does this topic matter right now?

## 📊 Key Findings & Intelligence Highlights
- List 5 highly specific, data-driven points. 
- Include numbers, dates, or specific entity names found in the data.

## 🗞️ News & Real-Time Events Analysis
Synthesize current events from NewsAPI and The Guardian. Reference specific article titles and sources (e.g., "According to BBC News...").

## 🧪 Technical & Academic Perspective
Review arXiv papers and expert discussions. Mention specific paper titles and their research focus if available in the dataset.

## 🌐 Social Sentiment & Public Discourse
Analyze Reddit discussions and community sentiment. Mention subreddit names, upvote ratios, or common community arguments.

## 💰 Economic & Market Impact (Crypto/Finance)
If relevant data exists from CoinCap/finance sources, synthesize the market implications. Include symbol performance or market caps.

## ⚖️ Strategic Implications & Recommendations
2-3 paragraphs on the future trajectory and expert actionable advice.

## 🛡️ Resilience Metadata
This report was synthesized using the Multi-LLM AgentMesh Fallback Chain for maximum reliability.

Final Instruction: Be verbose where data allows, but stay objective. The report must be 600-800 words if the context window permits.`;

  return await callLLM(prompt, 'high');
}
