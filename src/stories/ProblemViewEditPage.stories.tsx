// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { ProblemViewEditPage } from '@/pages/ProblemViewEditPage';
import { ServiceHealthProvider } from '@/contexts/ServiceHealthContext';

const mockExam = {
  id: '1',
  examName: '微分積分学の基礎問題',
  subjectName: '数学',
  universityName: '東京大学',
  facultyName: '理学部',
  viewCount: 1234,
  goodCount: 567,
  badCount: 12,
  commentCount: 89,
  bookmarkCount: 123,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  userName: '田中太郎',
  questions: [],
};

const meta: Meta<typeof ProblemViewEditPage> = {
  title: 'Pages/ProblemViewEditPage',
  component: ProblemViewEditPage,
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
type Story = StoryObj<typeof ProblemViewEditPage>;

export const Default: Story = {
  args: {
    problemId: '1',
    onNavigate: () => { },
    onLogout: () => { },
  },
};
