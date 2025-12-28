import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes'; export default function ProgrammingView(props: ProblemTypeViewProps) { const { questionContent } = props; return ( <div> <div >プログラミング問題</div> <pre >{questionContent}</pre> </div> );
}
