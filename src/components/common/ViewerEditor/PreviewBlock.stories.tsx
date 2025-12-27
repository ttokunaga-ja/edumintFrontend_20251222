import React from 'react';
import PreviewBlock from './PreviewBlock';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PreviewBlock> = {
  title: 'ViewerEditor/PreviewBlock',
  component: PreviewBlock,
};

export default meta;

type Story = StoryObj<typeof PreviewBlock>;

export const Markdown: Story = {
  args: {
    content: '**bold** text',
    format: 0,
  },
};

export const Latex: Story = {
  args: {
    content: '\\frac{1}{x}',
    format: 1,
  },
};
