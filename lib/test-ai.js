/**
 * Test script for Multi-LLM fallback logic
 */
import { generateSubQueries, synthesizeReport } from './gemini.js';
import chalk from 'chalk';

async function runTests() {
  console.log(chalk.cyan('🚀 Starting Multi-LLM Fallback Tests...'));

  const topic = "Impact of AI in 2026";
  
  try {
    console.log(chalk.yellow('\n1. Testing Query Generation (Low Thinking)...'));
    const queries = await generateSubQueries(topic);
    console.log(chalk.green('✓ Queries Generated:'), queries.join(' | '));

    console.log(chalk.yellow('\n2. Testing Report Synthesis (High Thinking)...'));
    const mockResults = [
      { source: 'News', results: ['AI agents take over coding'] },
      { source: 'Academic', results: ['Reasoning models show 40% improvement'] }
    ];
    const report = await synthesizeReport(topic, mockResults);
    console.log(chalk.green('✓ Report Synthesized:'));
    console.log(report.slice(0, 200) + '...');

  } catch (err) {
    console.error(chalk.red('❌ Test Failed:'), err.message);
  }
}

runTests();
