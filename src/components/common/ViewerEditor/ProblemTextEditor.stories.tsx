import React from 'react';
import ProblemTextEditor from './ProblemTextEditor';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProblemTextEditor> = {
  title: 'ViewerEditor/ProblemTextEditor',
  component: ProblemTextEditor,
};

export default meta;

type Story = StoryObj<typeof ProblemTextEditor>;

export const Default: Story = {
  args: {
    value: 'Sample question',
    format: 0,
    onChange: (v: string) => console.log(v),
    onFormatChange: (f: 0 | 1) => console.log(f),
    ariaLabel: '問題文',
    placeholder: 'Markdown 形式で入力...',
  },
};
