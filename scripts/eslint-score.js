#!/usr/bin/env node
/* eslint-disable no-unused-vars, no-console */

/**
 * ESLint Score Generator - Similar to Pylint Rating
 * Generates a quality score (0-10) based on ESLint analysis results
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const calculateScore = (errors, warnings, totalFiles) => {
  let score = 10;

  if (totalFiles > 0) {
    const errorsPerFile = errors / totalFiles;
    const warningsPerFile = warnings / totalFiles;

    score -= errorsPerFile * 2;
    score -= warningsPerFile * 0.5;
  }

  return Math.max(0, Math.min(10, score));
};

const generateReport = (data) => {
  const errors = data.reduce((sum, file) => sum + file.errorCount, 0);
  const warnings = data.reduce((sum, file) => sum + file.warningCount, 0);
  const totalFiles = data.length;
  const filesWithIssues = data.filter(f => f.errorCount > 0 || f.warningCount > 0).length;

  const score = calculateScore(errors, warnings, totalFiles);

  let rating = '';
  if (score >= 9) rating = 'EXCELLENT (A+)';
  else if (score >= 8) rating = 'VERY GOOD (A)';
  else if (score >= 7) rating = 'GOOD (B)';
  else if (score >= 6) rating = 'SATISFACTORY (C)';
  else if (score >= 5) rating = 'ACCEPTABLE (D)';
  else if (score >= 3) rating = 'POOR (E)';
  else rating = 'VERY POOR (F)';

  return {
    score: score.toFixed(2),
    rating,
    totalFiles,
    filesWithIssues,
    errors,
    warnings,
    issuePerFile: totalFiles > 0 ? ((errors + warnings) / totalFiles).toFixed(2) : '0.00',
  };
};

const runEslint = () => {
  return new Promise((resolve, reject) => {
    try {
      const output = execSync('npx eslint . --format json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 10 * 1024 * 1024,
      });
      
      const trimmed = output.trim();
      if (!trimmed) {
        resolve([]);
        return;
      }
      const data = JSON.parse(trimmed);
      resolve(data);
    } catch (e) {
      if (e.stdout) {
        try {
          const data = JSON.parse(e.stdout);
          resolve(data);
        } catch (parseError) {
          reject(new Error(`Failed to parse ESLint output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Failed to run ESLint: ${e.message}`));
      }
    }
  });
};

const main = async () => {
  try {
    console.log('🔍 Running ESLint analysis...\n');

    const data = await runEslint();
    const report = generateReport(data);

    console.log('╔════════════════════════════════════════╗');
    console.log('║      ESLint Code Quality Report       ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`📊 Score: ${report.score}/10`);
    console.log(`⭐ Rating: ${report.rating}\n`);

    console.log('📈 Statistics:');
    console.log(`  • Total Files Analyzed: ${report.totalFiles}`);
    console.log(`  • Files with Issues: ${report.filesWithIssues}`);
    console.log(`  • Total Errors: ${report.errors} ❌`);
    console.log(`  • Total Warnings: ${report.warnings} ⚠️`);
    console.log(`  • Issues per File: ${report.issuePerFile}\n`);

    console.log('📋 Score Interpretation:');
    console.log('  • 9.0-10.0: EXCELLENT - Production-ready code');
    console.log('  • 8.0-8.9:  VERY GOOD - Minor improvements needed');
    console.log('  • 7.0-7.9:  GOOD - Some improvements recommended');
    console.log('  • 6.0-6.9:  SATISFACTORY - Address issues');
    console.log('  • 5.0-5.9:  ACCEPTABLE - Significant improvements needed');
    console.log('  • 3.0-4.9:  POOR - Major refactoring required');
    console.log('  • 0.0-2.9:  VERY POOR - Critical issues\n');

    if (report.score >= 9) {
      console.log('✅ Status: Code quality is excellent!');
    } else if (report.score >= 7) {
      console.log('⚠️  Status: Code quality is good, minor improvements recommended');
    } else {
      console.log('❌ Status: Critical improvements needed');
    }

    // Save report to JSON file
    const reportPath = path.join(process.cwd(), 'eslint-score-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: eslint-score-report.json`);
  } catch (error) {
    console.error('❌ Error generating score:', error.message);
    process.exit(1);
  }
};

main();
