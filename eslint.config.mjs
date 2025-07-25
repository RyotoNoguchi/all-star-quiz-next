// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

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
      // Enforce direct export syntax (prevent separate export statements)
      'import/no-default-export': 'off', // Allow default exports for pages
      'import/prefer-default-export': 'off', // Prefer named exports
    },
  },
  // Specific rules for UI components to enforce export patterns
  {
    files: ['src/components/ui/**/*'],
    rules: {
      // Prevent separate export statements in UI components
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration=null]',
          message: 'Use direct export syntax (export const Component = ...) instead of separate export statements',
        },
      ],
    },
  },
  ...storybook.configs["flat/recommended"]
]

export default eslintConfig