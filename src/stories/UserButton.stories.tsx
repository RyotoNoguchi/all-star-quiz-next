import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock UserButton component for demonstration
const MockUserButton = ({ variant }: { variant: 'signed-out' | 'loading' | 'with-image' | 'without-image' }) => {
  if (variant === 'loading') {
    return <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
  }

  if (variant === 'signed-out') {
    return (
      <Button variant="outline" size="sm" onClick={action('sign-in-clicked')}>
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full"
          onClick={action('dropdown-opened')}
        >
          {variant === 'with-image' ? (
            <img
              className="h-8 w-8 rounded-full"
              src="https://via.placeholder.com/32x32/4F46E5/ffffff?text=JD"
              alt="User"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              J
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">John Doe</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              john.doe@example.com
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={action('profile-clicked')}>
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={action('games-clicked')}>
          My Games
        </DropdownMenuItem>

        <DropdownMenuItem onClick={action('leaderboard-clicked')}>
          Leaderboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={action('sign-out-clicked')}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta: Meta<typeof MockUserButton> = {
  title: 'Auth/UserButton',
  component: MockUserButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'User authentication button that shows sign-in for anonymous users or profile dropdown for authenticated users.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-slate-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['signed-out', 'loading', 'with-image', 'without-image'],
      description: 'The user authentication state to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const SignedOut: Story = {
  args: {
    variant: 'signed-out',
  },
  parameters: {
    docs: {
      description: {
        story: 'User button when no user is signed in - shows sign-in link.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    variant: 'loading',
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with pulsing placeholder.',
      },
    },
  },
}

export const SignedInWithImage: Story = {
  args: {
    variant: 'with-image',
  },
  parameters: {
    docs: {
      description: {
        story: 'Signed-in user with profile image in dropdown trigger.',
      },
    },
  },
}

export const SignedInWithoutImage: Story = {
  args: {
    variant: 'without-image',
  },
  parameters: {
    docs: {
      description: {
        story: 'Signed-in user without profile image - shows initial letter avatar.',
      },
    },
  },
}

// Demo showing all states
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center text-white mb-6">
        <h3 className="text-xl font-bold mb-2">User Button States</h3>
        <p className="text-white/70">Different authentication states</p>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Signed Out</h4>
          <div className="flex justify-center">
            <MockUserButton variant="signed-out" />
          </div>
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Loading</h4>
          <div className="flex justify-center">
            <MockUserButton variant="loading" />
          </div>
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">With Avatar</h4>
          <div className="flex justify-center">
            <MockUserButton variant="with-image" />
          </div>
        </div>
        
        <div className="text-center">
          <h4 className="text-white text-lg mb-4">Initial Avatar</h4>
          <div className="flex justify-center">
            <MockUserButton variant="without-image" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual comparison of all user button states.',
      },
    },
  },
}