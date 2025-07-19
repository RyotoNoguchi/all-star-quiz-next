#!/usr/bin/env node

/**
 * Implementation Verification Script
 * 
 * Mandatory post-implementation verification to prevent compilation errors
 * and ensure code quality standards are maintained.
 * 
 * Usage: npm run verify
 */

const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Color utilities (simple implementation)
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

const VERIFICATION_STEPS = [
  {
    name: 'TypeScript Compilation Check',
    command: 'npm run type-check',
    critical: true,
    description: 'Ensures no TypeScript compilation errors exist'
  },
  {
    name: 'ESLint Validation',
    command: 'npm run lint:check',
    critical: true,
    description: 'Validates code follows linting rules and arrow function enforcement'
  },
  {
    name: 'Arrow Function Compliance',
    command: 'npm run check:arrow-functions',
    critical: true,
    description: 'Verifies no function declarations exist in React components'
  },
  {
    name: 'Production Build Test',
    command: 'npm run build',
    critical: true,
    description: 'Tests that application can build successfully for production'
  },
  {
    name: 'Code Formatting Check',
    command: 'npm run format:check',
    critical: false,
    description: 'Verifies code is properly formatted with Prettier'
  }
]

const runVerificationStep = async (step) => {
  console.log(colors.blue(`🔍 Running: ${step.name}`))
  console.log(colors.gray(`   ${step.description}`))
  
  try {
    const { stdout, stderr } = await execAsync(step.command)
    
    if (stderr && stderr.trim()) {
      console.log(colors.yellow(`   Warning: ${stderr.trim()}`))
    }
    
    console.log(colors.green(`✅ ${step.name} - PASSED`))
    return { success: true, step: step.name }
    
  } catch (error) {
    console.log(colors.red(`❌ ${step.name} - FAILED`))
    console.log(colors.red(`   Error: ${error.message}`))
    
    if (error.stdout) {
      console.log(colors.gray(`   Output: ${error.stdout.trim()}`))
    }
    
    return { success: false, step: step.name, error: error.message }
  }
}

const main = async () => {
  console.log(colors.bold(colors.blue('🚨 MANDATORY Post-Implementation Verification')))
  console.log(colors.gray('Preventing compilation errors and ensuring code quality\n'))
  
  const results = []
  let criticalFailures = 0
  
  for (const step of VERIFICATION_STEPS) {
    const result = await runVerificationStep(step)
    results.push(result)
    
    if (!result.success && step.critical) {
      criticalFailures++
    }
    
    console.log() // Empty line between steps
  }
  
  // Summary
  console.log(colors.bold('📊 Verification Summary:'))
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(colors.green(`✅ Passed: ${passed}`))
  if (failed > 0) {
    console.log(colors.red(`❌ Failed: ${failed}`))
  }
  
  if (criticalFailures > 0) {
    console.log(colors.bold(colors.red('\n🚨 CRITICAL VERIFICATION FAILURES DETECTED')))
    console.log(colors.red('Implementation is INCOMPLETE and must be fixed immediately.'))
    console.log(colors.red('The following critical steps failed:'))
    
    results
      .filter(r => !r.success)
      .forEach(r => {
        const step = VERIFICATION_STEPS.find(s => s.name === r.step)
        if (step && step.critical) {
          console.log(colors.red(`  • ${r.step}`))
        }
      })
    
    console.log(colors.yellow('\n📋 Resolution Steps:'))
    console.log(colors.yellow('1. Fix all compilation/linting errors shown above'))
    console.log(colors.yellow('2. Re-run this verification script'))
    console.log(colors.yellow('3. Only consider task complete when ALL verifications pass'))
    
    process.exit(1)
  }
  
  console.log(colors.bold(colors.green('\n🎉 ALL VERIFICATIONS PASSED')))
  console.log(colors.green('Implementation meets quality standards and is ready for deployment.'))
  
  process.exit(0)
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error(colors.red('Verification script failed:'), error)
    process.exit(1)
  })
}

module.exports = { runVerificationStep, VERIFICATION_STEPS }