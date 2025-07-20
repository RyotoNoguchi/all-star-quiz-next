import type { Meta, StoryObj } from '@storybook/nextjs';
import { action } from 'storybook/actions';
import { Search, Download, Plus, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: action('clicked') },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Variant stories
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

export const Quiz: Story = {
  args: {
    variant: 'quiz',
    children: 'Quiz Button',
  },
};

// Size stories
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
  },
  render: () => (
    <Button size="icon">
      <Settings />
    </Button>
  ),
};

// With icons
export const WithIcon: Story = {
  render: () => (
    <Button>
      <Search className="mr-2 h-4 w-4" />
      Search
    </Button>
  ),
};

export const DownloadButton: Story = {
  render: () => (
    <Button variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
  ),
};

export const Create: Story = {
  render: () => (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create New
    </Button>
  ),
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// Loading state simulation
export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
};