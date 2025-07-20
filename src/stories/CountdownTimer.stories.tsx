import type { Meta, StoryObj } from '@storybook/nextjs'
import { CountdownTimer } from '../components/game/countdown-timer'

const meta: Meta<typeof CountdownTimer> = {
  title: 'Game/CountdownTimer',
  component: CountdownTimer,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    docs: {
      description: {
        component: '10-second countdown timer with progress bar and urgency states. Features color changes and animations based on remaining time.',
      },
    },
  },
  argTypes: {
    timeLeft: {
      control: { type: 'range', min: 0, max: 10, step: 1 },
      description: 'Remaining time in seconds',
    },
    totalTime: {
      control: { type: 'range', min: 5, max: 30, step: 1 },
      description: 'Total countdown duration',
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the timer is currently active',
    },
  },
  args: {
    totalTime: 10,
    isActive: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Different time states
export const FullTime: Story = {
  args: {
    timeLeft: 10,
    totalTime: 10,
  },
}

export const HalfTime: Story = {
  args: {
    timeLeft: 5,
    totalTime: 10,
  },
}

export const UrgentTime: Story = {
  args: {
    timeLeft: 2,
    totalTime: 10,
  },
}

export const TimeUp: Story = {
  args: {
    timeLeft: 0,
    totalTime: 10,
  },
}

// Different urgency levels
export const Safe: Story = {
  args: {
    timeLeft: 8,
    totalTime: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Safe time range (>50% remaining) - green progress bar, white text.',
      },
    },
  },
}

export const Warning: Story = {
  args: {
    timeLeft: 4,
    totalTime: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning time range (20-50% remaining) - yellow progress bar and text.',
      },
    },
  },
}

export const Critical: Story = {
  args: {
    timeLeft: 1,
    totalTime: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical time range (≤20% remaining) - red styling with pulsing animation and warning message.',
      },
    },
  },
}

// Timer progression simulation
export const TimerProgression: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center text-white mb-6">
        <h3 className="text-xl font-bold mb-2">Timer Progression Showcase</h3>
        <p className="text-white/70">Different states during countdown</p>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Start (10s)</h4>
          <CountdownTimer timeLeft={10} totalTime={10} />
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Mid (5s)</h4>
          <CountdownTimer timeLeft={5} totalTime={10} />
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Warning (2s)</h4>
          <CountdownTimer timeLeft={2} totalTime={10} />
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Time Up (0s)</h4>
          <CountdownTimer timeLeft={0} totalTime={10} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual progression of timer states from start to finish.',
      },
    },
  },
}

// Different total times
export const ShortTimer: Story = {
  args: {
    timeLeft: 3,
    totalTime: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shorter timer duration for quick questions.',
      },
    },
  },
}

export const LongTimer: Story = {
  args: {
    timeLeft: 15,
    totalTime: 20,
  },
  parameters: {
    docs: {
      description: {
        story: 'Longer timer duration for complex questions.',
      },
    },
  },
}

// Edge cases
export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center text-white mb-6">
        <h3 className="text-xl font-bold mb-2">Edge Cases</h3>
        <p className="text-white/70">Testing boundary conditions</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Single Second (1s total)</h4>
          <CountdownTimer timeLeft={1} totalTime={1} />
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Zero Time Remaining</h4>
          <CountdownTimer timeLeft={0} totalTime={30} />
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Maximum Progress (30s)</h4>
          <CountdownTimer timeLeft={30} totalTime={30} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Edge cases including minimum time, maximum time, and zero remaining time.',
      },
    },
  },
}