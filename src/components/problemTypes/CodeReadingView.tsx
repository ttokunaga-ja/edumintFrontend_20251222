import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes'; export default function CodeReadingView(props: ProblemTypeViewProps) { const { questionContent } = props; return ( <div> <div >コード読解</div> <pre >{questionContent}</pre> </div> );
}
