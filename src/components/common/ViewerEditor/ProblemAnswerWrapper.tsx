import React from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import DescriptiveEditor from './Descriptive';
import SelectionEditor from './Selection';
import FillInBlankEditor from './FillInBlank';
import TrueFalseEditor from './TrueFalse';
import MathCalculationEditor from './MathCalculation';
import ProofEditor from './Proof';
import ProgrammingEditor from './Programming';
import CodeReadingEditor from './CodeReading';

type Props = ProblemTypeEditProps & { formatId: number };

export default function ProblemAnswerWrapper({ formatId, ...rest }: Props) {
  switch (formatId) {
    case 1:
      return <DescriptiveEditor {...rest} />;
    case 2:
      return <SelectionEditor {...rest} />;
    case 4:
      return <FillInBlankEditor {...rest} />;
    case 5:
      return <TrueFalseEditor {...rest} />;
    case 6:
      return <MathCalculationEditor {...rest} />;
    case 7:
      return <ProofEditor {...rest} />;
    case 8:
      return <ProgrammingEditor {...rest} />;
    case 9:
      return <CodeReadingEditor {...rest} />;
    default:
      return <div>形式を選択してください</div>;
  }
}
