import React from 'react';
import { ProblemTypeEditProps, ProblemTypeRegistration, ProblemTypeViewProps } from '@/types/problemTypes';

const registry = new Map<number, ProblemTypeRegistration>();

export function registerProblemType(entry: ProblemTypeRegistration) {
  registry.set(entry.id, entry);
}

export function getProblemTypeView(typeId: number): React.ComponentType<ProblemTypeViewProps> | null {
  const entry = registry.get(typeId);
  return entry ? entry.view : null;
}

export function getProblemTypeEdit(typeId: number): React.ComponentType<ProblemTypeEditProps> | null {
  const entry = registry.get(typeId);
  return entry && entry.edit ? entry.edit : null;
}

// Helper to register default/basic types. Consumers can register more.
export function registerDefaults() {
  // lazy require to avoid load-order issues
  try {
    // Free text
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FreeText = require('./FreeTextView').default;
    const FreeTextEdit = React.lazy(() => import('@/components/common/ViewerEditor/Descriptive'));
    registerProblemType({ id: 1, view: FreeText, edit: FreeTextEdit });

    const MultipleChoice = require('./MultipleChoiceView').default;
    const MultipleChoiceEdit = React.lazy(() => import('@/components/common/ViewerEditor/Selection'));
    registerProblemType({ id: 2, view: MultipleChoice, edit: MultipleChoiceEdit });

    const Cloze = require('./ClozeView').default;
    const ClozeEdit = React.lazy(() => import('@/components/common/ViewerEditor/FillInBlank'));
    registerProblemType({ id: 4, view: Cloze, edit: ClozeEdit });

    const TrueFalse = require('./TrueFalseView').default;
    const TrueFalseEdit = React.lazy(() => import('@/components/common/ViewerEditor/TrueFalse'));
    registerProblemType({ id: 5, view: TrueFalse, edit: TrueFalseEdit });

    const Numeric = require('./NumericView').default;
    const NumericEdit = React.lazy(() => import('@/components/common/ViewerEditor/MathCalculation'));
    registerProblemType({ id: 6, view: Numeric, edit: NumericEdit });

    const Proof = require('./ProofView').default;
    const ProofEdit = React.lazy(() => import('@/components/common/ViewerEditor/Proof'));
    registerProblemType({ id: 7, view: Proof, edit: ProofEdit });

    const Programming = require('./ProgrammingView').default;
    const ProgrammingEdit = React.lazy(() => import('@/components/common/ViewerEditor/Programming'));
    registerProblemType({ id: 8, view: Programming, edit: ProgrammingEdit });

    const CodeReading = require('./CodeReadingView').default;
    const CodeReadingEdit = React.lazy(() => import('@/components/common/ViewerEditor/CodeReading'));
    registerProblemType({ id: 9, view: CodeReading, edit: CodeReadingEdit });
  } catch (e) {
    // ignore in environments where require isn't resolved at module load
    // registry can be populated later
    // console.warn('ProblemTypeRegistry defaults not registered', e);
  }
}

export default { registerProblemType, getProblemTypeView, getProblemTypeEdit, registerDefaults };
