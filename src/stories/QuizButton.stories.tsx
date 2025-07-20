import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'
import { QuizButton } from '../components/game/quiz-button'

const meta: Meta<typeof QuizButton> = {
  title: 'Game/QuizButton',
  component: QuizButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Multi-choice quiz button with different states for gameplay feedback. Supports A/B/C/D choices with selection, result, and disabled states.',
      },
    },
  },
  argTypes: {
    choice: {
      control: { type: 'select' },
      options: ['A', 'B', 'C', 'D'],
      description: 'The choice letter (A, B, C, or D)',
    },
    text: {
      control: 'text',
      description: 'The answer text to display',
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'selected', 'correct', 'incorrect', 'disabled'],
      description: 'Visual state of the button',
    },
    showResult: {
      control: 'boolean',
      description: 'Whether to show result styling (for correct/incorrect states)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    onClick: action('button-clicked'),
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default states
export const Default: Story = {
  args: {
    choice: 'A',
    text: 'This is a sample answer choice',
    state: 'default',
    showResult: false,
    disabled: false,
  },
}

export const Selected: Story = {
  args: {
    choice: 'B',
    text: 'Selected answer choice',
    state: 'selected',
    showResult: false,
    disabled: false,
  },
}

// Result states
export const Correct: Story = {
  args: {
    choice: 'C',
    text: 'Correct answer choice',
    state: 'correct',
    showResult: true,
    disabled: true,
  },
}

export const Incorrect: Story = {
  args: {
    choice: 'D',
    text: 'Incorrect answer choice',
    state: 'incorrect',
    showResult: true,
    disabled: true,
  },
}

export const Disabled: Story = {
  args: {
    choice: 'A',
    text: 'Disabled answer choice',
    state: 'disabled',
    showResult: false,
    disabled: true,
  },
}

// All choices showcase
export const AllChoices: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <QuizButton
        choice="A"
        text="First answer option"
        state="default"
        onClick={action('choice-a-clicked')}
      />
      <QuizButton
        choice="B"
        text="Second answer option"
        state="selected"
        onClick={action('choice-b-clicked')}
      />
      <QuizButton
        choice="C"
        text="Third answer option"
        state="correct"
        showResult={true}
        disabled={true}
        onClick={action('choice-c-clicked')}
      />
      <QuizButton
        choice="D"
        text="Fourth answer option"
        state="incorrect"
        showResult={true}
        disabled={true}
        onClick={action('choice-d-clicked')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all four choice buttons with different states.',
      },
    },
  },
}

// Interactive gameplay simulation
export const GameplayFlow: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">1. During Question (Interactive)</h3>
        <div className="space-y-2 w-96">
          <QuizButton
            choice="A"
            text="Tokyo"
            state="default"
            onClick={action('gameplay-a-clicked')}
          />
          <QuizButton
            choice="B"
            text="Osaka"
            state="selected"
            onClick={action('gameplay-b-clicked')}
          />
          <QuizButton
            choice="C"
            text="Kyoto"
            state="default"
            onClick={action('gameplay-c-clicked')}
          />
          <QuizButton
            choice="D"
            text="Yokohama"
            state="default"
            onClick={action('gameplay-d-clicked')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">2. After Answer Revealed</h3>
        <div className="space-y-2 w-96">
          <QuizButton
            choice="A"
            text="Tokyo"
            state="correct"
            showResult={true}
            disabled={true}
            onClick={action('result-a-clicked')}
          />
          <QuizButton
            choice="B"
            text="Osaka"
            state="incorrect"
            showResult={true}
            disabled={true}
            onClick={action('result-b-clicked')}
          />
          <QuizButton
            choice="C"
            text="Kyoto"
            state="disabled"
            disabled={true}
            onClick={action('result-c-clicked')}
          />
          <QuizButton
            choice="D"
            text="Yokohama"
            state="disabled"
            disabled={true}
            onClick={action('result-d-clicked')}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simulation of button states during quiz gameplay - from interactive selection to result display.',
      },
    },
  },
}

// Long text handling
export const LongText: Story = {
  args: {
    choice: 'A',
    text: 'This is a very long answer choice that demonstrates how the button handles text wrapping and maintains proper layout with extended content that might span multiple lines in the quiz interface',
    state: 'default',
    showResult: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing button behavior with long text content.',
      },
    },
  },
}