#!/usr/bin/env node

/**
 * Script to check for function declaration violations in React components
 * This enforces the rule: ALL React components must be arrow functions
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');

console.log('🔍 Checking for function declaration violations...\n');

// Directories to check
const checkDirs = [
  'src/components/',
  'src/app/',
  'src/lib/'
];

let hasViolations = false;

checkDirs.forEach(dir => {
  if (!existsSync(dir)) {
    console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
    return;
  }

  try {
    console.log(`📁 Checking ${dir}...`);
    
    // Find function declarations (React components and other functions)
    const result = execSync(
      `grep -rn '^export function \\|^function [A-Z]' ${dir} || true`,
      { encoding: 'utf-8' }
    );

    if (result.trim()) {
      hasViolations = true;
      console.log(`❌ Found violations in ${dir}:`);
      console.log(result);
    } else {
      console.log(`✅ No violations found in ${dir}`);
    }
  } catch (error) {
    console.error(`Error checking ${dir}:`, error.message);
  }
});

console.log('\n' + '='.repeat(50));

if (hasViolations) {
  console.log('❌ VIOLATIONS FOUND!');
  console.log('\n💡 Fix by converting to arrow functions:');
  console.log('   From: function ComponentName() { ... }');
  console.log('   To:   const ComponentName = () => { ... }');
  console.log('\n🔧 Auto-fix available in many cases with ESLint:');
  console.log('   npm run lint:fix');
  process.exit(1);
} else {
  console.log('✅ All React components use arrow functions correctly!');
  console.log('🎉 Coding rule compliance verified.');
  process.exit(0);
}