// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { HomePage } from '@/pages/HomePage';
import { ServiceHealthProvider } from '@/contexts/ServiceHealthContext';

const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ServiceHealthProvider>
        <Story />
      </ServiceHealthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {
  args: {
    initialQuery: '',
  },
};
