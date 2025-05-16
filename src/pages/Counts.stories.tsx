import type { Meta, StoryObj } from '@storybook/react';

import Counts from './Counts';

const meta = {
  component: Counts,
} satisfies Meta<typeof Counts>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};