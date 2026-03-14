/**
 * AgentMesh — Gemini AI wrapper
 * generateSubQueries: breaks topic → 3 targeted search queries
 * synthesizeReport:  turns multi-source data → structured research report
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  const result = await model.generateContent(prompt);
  const text = (await result.response).text().trim();
  const queries = text.split('\n').map(q => q.trim()).filter(q => q.length > 3);
  return queries.slice(0, 3);
}

/**
 * Synthesize a structured research report from multi-source data
 */
export async function synthesizeReport(topic, allResults) {
  // Truncate data string to avoid token limit
  let dataStr = JSON.stringify(allResults, null, 2);
  if (dataStr.length > 8000) dataStr = dataStr.slice(0, 8000) + '... [TRUNCATED]';

  const prompt = `You are an elite research analyst. Synthesize a comprehensive research report on: "${topic}"

Using this collected data from multiple paid sources:
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

Be specific, cite source names, include metrics where available. Target: 450-550 words.`;

  const result = await model.generateContent(prompt);
  return (await result.response).text();
}
