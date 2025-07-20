import type { Preview } from '@storybook/nextjs'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
        {
          name: 'quiz-gradient',
          value: 'linear-gradient(135deg, hsl(217 119 6) 0%, hsl(14 165 233) 50%, hsl(180 83 9) 100%)',
        },
      ],
    },
  },
};

export default preview;