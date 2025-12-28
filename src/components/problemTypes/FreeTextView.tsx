import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock'; export default function FreeTextView(props: ProblemTypeViewProps) { const { questionContent, questionFormat } = props; return ( <div> {questionFormat === 0 ? ( <MarkdownBlock content={questionContent} /> ) : ( <LatexBlock content={questionContent} displayMode={false} /> )} </div> );
}
