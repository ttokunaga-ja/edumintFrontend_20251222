import React from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import DescriptiveEditor from './Type1_Descriptive';
import SelectionEditor from './Type2_Selection';
import FillInBlankEditor from './Type4_FillInBlank';
import TrueFalseEditor from './Type5_TrueFalse';
import MathCalculationEditor from './Type6_MathCalculation';
import ProofEditor from './Type7_Proof';
import ProgrammingEditor from './Type8_Programming';
import CodeReadingEditor from './Type9_CodeReading';

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
