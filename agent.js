/**
 * AgentMesh — agent.js
 * Master CLI Orchestrator: accepts a topic, runs the full x402 research pipeline
 * Usage: node agent.js "your research topic"
 *        node agent.js "topic" --dry-run
 */

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { executeResearch } from './lib/agentRunner.js';

dotenv.config();

const program = new Command();

function printBanner() {
  console.log(chalk.bold.blue(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ██████╗  ██████╗ ███████╗███╗   ██╗████████╗███╗   ███╗   ║
║  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝████╗ ████║   ║
║  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██╔████╔██║   ║
║  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║╚██╔╝██║   ║
║  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║ ╚═╝ ██║   ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝   ║
║                                                              ║
║          Autonomous x402 Research Network  v1.0             ║
║          Powered by Avalanche Fuji · Gasless USDC           ║
╚══════════════════════════════════════════════════════════════╝
`));
}

program
  .name('agentmesh')
  .description('Autonomous x402 Research Agent on Avalanche Fuji')
  .argument('<topic>', 'Research topic to investigate')
  .option('-p, --priority <level>', 'Priority level (High, Medium, Low)', 'Medium')
  .option('-r, --retries <number>', 'Max payment retries per sub-agent', '2')
  .option('--dry-run', 'Simulate flow without real payments')
  .action(async (topic, options) => {
    printBanner();

    if (options.dryRun) {
      console.log(chalk.yellow('⚠  DRY-RUN MODE — payments simulated, no real USDC spent\n'));
    }

    console.log(chalk.bold.white(`📌 Research Topic: "${topic}"`));
    console.log(chalk.dim(`   Priority: ${options.priority} | Max Retries: ${options.retries}\n`));

    // Validate critical env
    if (!process.env.PRIVATE_KEY && !options.dryRun) {
      console.log(chalk.red('❌ PRIVATE_KEY not set in .env — payments will fail'));
      console.log(chalk.dim('   Run with --dry-run to test without payments\n'));
    }
    if (!process.env.GEMINI_API_KEY) {
      console.log(chalk.yellow('⚠  GEMINI_API_KEY not set — will use fallback queries\n'));
    }

    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.cyan('  Step 1/5: Checking Avalanche Fuji network...'));

    try {
      const result = await executeResearch({
        topic,
        priority: options.priority,
        maxRetries: parseInt(options.retries, 10),
        log: (msg) => console.log(chalk.dim(`  [Agent] ${msg}`))
      });

      // Success summary box
      const totalUSDC = (result.payments * 0.1).toFixed(1);

      console.log(chalk.dim('\n' + '─'.repeat(60)));
      console.log(chalk.bold.blue(`
╔══════════════════════════════════════════════════════════╗
║                   ✅ RESEARCH COMPLETE                   ║
╠══════════════════════════════════════════════════════════╣`));
      console.log(`║  Topic:      ${chalk.white(topic.slice(0, 44).padEnd(44))}║`);
      console.log(`║  Sub-Agents: ${chalk.white(String(result.queries?.length || 3).padEnd(44))}║`);
      console.log(`║  Payments:   ${chalk.green((String(result.payments) + ' × 0.1 USDC = ' + totalUSDC + ' USDC').padEnd(44))}║`);
      console.log(`║  Sources:    ${chalk.white((result.sources?.join(', ') || '—').slice(0, 44).padEnd(44))}║`);
      console.log(`║  Time:       ${chalk.white((result.elapsed + 's').padEnd(44))}║`);
      console.log(`║  Report:     ${chalk.cyan(result.reportPath.split(/[\\/]/).slice(-2).join('/').padEnd(44))}║`);
      console.log(chalk.bold.blue(`╚══════════════════════════════════════════════════════════╝`));

      // Payment proofs
      if (result.paymentList?.length > 0) {
        console.log(chalk.bold.white('\n💸 On-Chain Payment Proofs:'));
        result.paymentList.forEach((p, i) => {
          console.log(chalk.green(`   ${i + 1}. ${p.source} — ${p.txHash}`));
          console.log(chalk.cyan(`      🔗 https://testnet.snowtrace.io/tx/${p.txHash}`));
        });
      }

      // Registry tx
      if (result.registryTx) {
        console.log(chalk.bold.white('\n🤖 ERC-8004 Agent Registration:'));
        console.log(chalk.green(`   txHash: ${result.registryTx}`));
        console.log(chalk.cyan(`   🔗 https://testnet.snowtrace.io/tx/${result.registryTx}`));
      }

      // Report preview
      console.log(chalk.bold.white('\n📄 Report Preview:\n'));
      const preview = result.report?.slice(0, 600) || '';
      console.log(chalk.white(preview + (result.report?.length > 600 ? '\n...' : '')));
      console.log(chalk.dim(`\nFull report saved → ${result.reportPath}`));

    } catch (error) {
      console.error(chalk.red('\n❌ Fatal agent error:'), error.message);
      console.error(chalk.dim(error.stack));
      process.exit(1);
    }
  });

program.parse();
