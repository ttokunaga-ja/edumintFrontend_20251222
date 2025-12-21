// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { ProblemCreatePage } from '@/pages/ProblemCreatePage';
import { ServiceHealthProvider } from '@/contexts/ServiceHealthContext';

const meta: Meta<typeof ProblemCreatePage> = {
  title: 'Pages/ProblemCreatePage',
  component: ProblemCreatePage,
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
type Story = StoryObj<typeof ProblemCreatePage>;

export const Default: Story = {
  args: {
    onNavigate: () => { },
    onLogout: () => { },
  },
};
