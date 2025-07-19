import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
  {
    rules: {
      // Enforce React component arrow function rule from CLAUDE.md
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      // Allow unused variables with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Enforce arrow functions in specific directories
  {
    files: ['src/components/**/*', 'src/app/**/*', 'src/lib/**/*'],
    rules: {
      // Prevent function declarations entirely in these directories
      'func-style': [
        'error',
        'expression',
        {
          allowArrowFunctions: true,
        },
      ],
    },
  },
]

export default eslintConfig