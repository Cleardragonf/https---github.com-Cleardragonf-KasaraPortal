import type { Meta, StoryObj } from '@storybook/react';

import Archive from './Archive';

const meta = {
  component: Archive,
} satisfies Meta<typeof Archive>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};