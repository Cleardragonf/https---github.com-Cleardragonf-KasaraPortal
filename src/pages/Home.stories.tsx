import type { Meta, StoryObj } from '@storybook/react';

import Home from './Home';

const meta = {
  component: Home,
} satisfies Meta<typeof Home>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};