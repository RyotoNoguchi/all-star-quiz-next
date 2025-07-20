import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'
import { ActionButtons } from '../components/home/action-buttons'

const meta: Meta<typeof ActionButtons> = {
  title: 'Home/ActionButtons',
  component: ActionButtons,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      ],
    },
    docs: {
      description: {
        component: 'Interactive action buttons for the home page. Includes demo game access and how-to-play information.',
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        push: action('navigation-push'),
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnGradientBackground: Story = {
  parameters: {
    backgrounds: {
      default: 'gradient',
    },
    docs: {
      description: {
        story: 'Action buttons displayed on a gradient background similar to the home page.',
      },
    },
  },
}

export const MobileLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile responsive layout with stacked buttons.',
      },
    },
  },
}

export const TabletLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet layout showing button arrangement.',
      },
    },
  },
}

// Multiple instances to show button interactions
export const InteractionDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center text-white mb-6">
        <h3 className="text-xl font-bold mb-2">Action Button States</h3>
        <p className="text-white/70">Hover and click to see interactions</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-white text-lg mb-2">Normal State</h4>
          <ActionButtons />
        </div>
      </div>
      
      <div className="text-center text-white/60 text-sm mt-4">
        <p>• デモゲームに参加 - Navigates to demo game</p>
        <p>• 遊び方 - Shows how-to-play information</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of button functionality and visual feedback.',
      },
    },
  },
}