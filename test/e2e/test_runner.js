#!/usr/bin/env node
/**
 * CampusNotify Enterprise E2E Test Runner
 *
 * Comprehensive, opaque-box, requirement-driven test runner for Tiers 1-4.
 * Features:
 * - Pure Node.js (v18+) with zero external heavy dependencies
 * - Selective tier filtering (--tier=1, --tier=2, --tier=3, --tier=4)
 * - Selective feature filtering (--feature=F01, --feature=12, --feature=attendance)
 * - Verbose diagnostic logging (--verbose)
 * - Clean ANSI colorized summary and failure reports
 * - Deterministic exit codes (0 = all pass, 1 = failure)
 */

const path = require('path');
const { ContractClient } = require('./harness/contract_client');

// ANSI Color Helpers
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: null,
    feature: null,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--tier=')) {
      const val = arg.split('=')[1].toLowerCase().replace('tier', '');
      options.tier = parseInt(val, 10);
    } else if (arg.startsWith('--feature=')) {
      options.feature = arg.split('=')[1].toLowerCase();
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${Colors.bright}${Colors.cyan}CampusNotify Enterprise E2E Test Suite Runner${Colors.reset}

${Colors.yellow}Usage:${Colors.reset}
  node test/e2e/test_runner.js [options]

${Colors.yellow}Options:${Colors.reset}
  --tier=<1|2|3|4|5>      Run tests only for the specified tier:
                           1: Feature Coverage (35 features, >=5 tests each = 175 tests)
                           2: Boundary & Corner Cases (175 tests)
                           3: Cross-Feature Interactions (20 tests)
                           4: Real-World Scenarios (5 scenarios)
                           5: Adversarial Coverage Hardening & Integration (11 tests)
  --feature=<id|name>     Filter tests by feature ID (e.g. F01, 12) or keyword (e.g. attendance)
  --verbose, -v           Show detailed output for every test case
  --help, -h              Display this help message and exit

${Colors.yellow}Examples:${Colors.reset}
  node test/e2e/test_runner.js
  node test/e2e/test_runner.js --tier=1
  node test/e2e/test_runner.js --tier=5 --verbose
  node test/e2e/test_runner.js --feature=12
  node test/e2e/test_runner.js --feature=nodues
`);
}

async function run() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log(`${Colors.bright}${Colors.blue}================================================================================${Colors.reset}`);
  console.log(`${Colors.bright}${Colors.cyan}  🚀 CampusNotify Enterprise Academic ERP & 3D Portal - E2E Test Suite${Colors.reset}`);
  console.log(`${Colors.dim}  Node.js ${process.version} | Architecture: Opaque-Box Requirement-Driven Harness${Colors.reset}`);
  console.log(`${Colors.bright}${Colors.blue}================================================================================${Colors.reset}\n`);

  // Load Tier Suites
  const suites = [
    {
      tier: 1,
      name: 'Tier 1: Feature Coverage (35 Features)',
      modules: [
        require('./tier1_features/tier1_core_security'),
        require('./tier1_features/tier1_academic_erp'),
        require('./tier1_features/tier1_submission_viva'),
        require('./tier1_features/tier1_frontend_3d'),
        require('./tier1_features/tier1_e2e_hardening')
      ]
    },
    {
      tier: 2,
      name: 'Tier 2: Boundary & Corner Cases (35 Features)',
      modules: [
        require('./tier2_boundaries/tier2_boundaries')
      ]
    },
    {
      tier: 3,
      name: 'Tier 3: Cross-Feature Interactions & Pairwise Combinations',
      modules: [
        require('./tier3_pairwise/tier3_cross_feature')
      ]
    },
    {
      tier: 4,
      name: 'Tier 4: Real-World Application Scenarios',
      modules: [
        require('./tier4_real_world/tier4_scenarios')
      ]
    },
    {
      tier: 5,
      name: 'Tier 5: Adversarial Coverage Hardening & Final Integration',
      modules: [
        require('./tier5_adversarial/tier5_adversarial')
      ]
    }
  ];

  const client = new ContractClient();
  const startTime = Date.now();

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  const failureReports = [];

  for (const suite of suites) {
    if (options.tier !== null && suite.tier !== options.tier) {
      continue;
    }

    console.log(`${Colors.bright}${Colors.magenta}▶ Running ${suite.name}${Colors.reset}`);
    let suitePassed = 0;
    let suiteFailed = 0;
    let suiteSkipped = 0;
    const suiteStartTime = Date.now();

    for (const mod of suite.modules) {
      if (options.verbose) {
        console.log(`  ${Colors.dim}Module: ${mod.name}${Colors.reset}`);
      }

      for (const test of mod.tests) {
        // Feature filtering
        if (options.feature) {
          const matchId = test.id && test.id.toLowerCase().includes(options.feature);
          const matchFid = test.featureId && String(test.featureId) === options.feature;
          const matchFname = test.featureName && test.featureName.toLowerCase().includes(options.feature);
          const matchName = test.name && test.name.toLowerCase().includes(options.feature);
          if (!matchId && !matchFid && !matchFname && !matchName) {
            suiteSkipped++;
            skippedTests++;
            continue;
          }
        }

        totalTests++;
        const testStart = Date.now();
        client.reset();

        try {
          await test.fn(client);
          const duration = Date.now() - testStart;
          suitePassed++;
          passedTests++;

          if (options.verbose) {
            console.log(`    ${Colors.green}✔ PASS${Colors.reset} ${Colors.dim}[${test.id}]${Colors.reset} ${test.name} ${Colors.dim}(${duration}ms)${Colors.reset}`);
          }
        } catch (err) {
          const duration = Date.now() - testStart;
          suiteFailed++;
          failedTests++;

          console.log(`    ${Colors.red}✖ FAIL${Colors.reset} ${Colors.bright}[${test.id}]${Colors.reset} ${test.name} ${Colors.dim}(${duration}ms)${Colors.reset}`);
          console.log(`      ${Colors.red}Error: ${err.message}${Colors.reset}`);

          failureReports.push({
            tier: suite.tier,
            id: test.id,
            name: test.name,
            error: err
          });
        }
      }
    }

    const suiteDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
    const suiteStatus = suiteFailed === 0
      ? `${Colors.green}ALL PASSED${Colors.reset}`
      : `${Colors.red}${suiteFailed} FAILED${Colors.reset}`;

    console.log(`  ${Colors.dim}Summary:${Colors.reset} ${Colors.bright}${suitePassed} passed${Colors.reset}, ${suiteFailed} failed, ${suiteSkipped} skipped (${suiteDuration}s) [${suiteStatus}]\n`);
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Final Summary Output
  console.log(`${Colors.bright}${Colors.blue}================================================================================${Colors.reset}`);
  console.log(`${Colors.bright}  TEST EXECUTION SUMMARY${Colors.reset}`);
  console.log(`${Colors.bright}${Colors.blue}================================================================================${Colors.reset}`);
  console.log(`  Total Tests Executed : ${Colors.bright}${totalTests}${Colors.reset}`);
  console.log(`  Passed               : ${Colors.green}${Colors.bright}${passedTests}${Colors.reset}`);
  console.log(`  Failed               : ${failedTests > 0 ? Colors.red : Colors.dim}${failedTests}${Colors.reset}`);
  console.log(`  Skipped              : ${Colors.yellow}${skippedTests}${Colors.reset}`);
  console.log(`  Total Duration       : ${Colors.cyan}${totalDuration} seconds${Colors.reset}`);
  console.log(`  Memory Usage (RSS)   : ${Colors.dim}${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB${Colors.reset}`);

  if (failureReports.length > 0) {
    console.log(`\n${Colors.bright}${Colors.red}FAILED TEST DETAILS:${Colors.reset}`);
    failureReports.forEach((f, idx) => {
      console.log(`\n  ${idx + 1}) [Tier ${f.tier}] [${f.id}] ${f.name}`);
      console.log(`     ${Colors.red}${f.error.stack || f.error.message}${Colors.reset}`);
    });
    console.log(`\n${Colors.bgRed}${Colors.white} STATUS: FAILED ${Colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${Colors.bgGreen}${Colors.bright}${Colors.white} STATUS: 100% PASS (ALL TIER SPECIFICATIONS VERIFIED) ${Colors.reset}\n`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(`${Colors.red}Fatal Runner Error: ${err.stack || err}${Colors.reset}`);
  process.exit(1);
});
