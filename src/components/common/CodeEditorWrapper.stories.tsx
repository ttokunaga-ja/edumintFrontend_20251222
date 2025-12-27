import React from 'react';
import CodeEditorWrapper from './CodeEditorWrapper';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CodeEditorWrapper> = {
  title: 'Common/CodeEditorWrapper',
  component: CodeEditorWrapper,
};

export default meta;

type Story = StoryObj<typeof CodeEditorWrapper>;

export const Default: Story = {
  args: {
    value: 'function foo() { return 42; }',
    onChange: (v: string) => console.log(v),
    ariaLabel: '解答 / メモ',
  },
};
