import React, { Suspense, useEffect } from 'react';
import { QuestionBlock } from './QuestionBlock';
import { Button } from '@/components/primitives/button';
import { Plus } from 'lucide-react';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';
import { ProblemTypeEditProps } from '@/types/problemTypes';

export interface ProblemEditorProps {
    exam: any;
    onChange: (exam: any) => void;
}

const editComponentLoaders: Record<number, React.LazyExoticComponent<React.ComponentType<ProblemTypeEditProps>>> = {
    1: React.lazy(() => import('@/components/problemTypes/FreeTextEdit')),
    2: React.lazy(() => import('@/components/problemTypes/MultipleChoiceEdit')),
    4: React.lazy(() => import('@/components/problemTypes/ClozeEdit')),
    5: React.lazy(() => import('@/components/problemTypes/TrueFalseEdit')),
    6: React.lazy(() => import('@/components/problemTypes/NumericEdit')),
    7: React.lazy(() => import('@/components/problemTypes/ProofEdit')),
    8: React.lazy(() => import('@/components/problemTypes/ProgrammingEdit')),
    9: React.lazy(() => import('@/components/problemTypes/CodeReadingEdit')),
};

const questionTypeLabels: Record<number, string> = {
    1: '記述式',
    2: '選択式',
    3: '穴埋め',
    4: '穴埋め',
    5: '正誤',
    6: '数値計算',
    7: '証明',
    8: 'プログラミング',
    9: 'コード読解',
};

const FallbackEdit = ({ questionContent, answerContent, onQuestionChange, onAnswerChange }: ProblemTypeEditProps) => (
    <div className="space-y-3 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm">
        <div className="text-gray-600">専用の編集フォームが未登録です。暫定フォームを使用します。</div>
        <label className="block text-xs font-medium text-gray-700">問題文</label>
        <textarea
            value={questionContent}
            onChange={(e) => onQuestionChange?.(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="小問の問題文を入力..."
        />
        <label className="block text-xs font-medium text-gray-700">解答</label>
        <textarea
            value={answerContent ?? ''}
            onChange={(e) => onAnswerChange?.(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="解答やメモを入力..."
        />
    </div>
);

export function ProblemEditor({ exam, onChange }: ProblemEditorProps) {
    const safeExam = exam ?? { questions: [] };
    const questions = Array.isArray(safeExam.questions) ? safeExam.questions : [];

    useEffect(() => {
        ProblemTypeRegistry.registerDefaults();
    }, []);

    const updateExam = (mutator: (draft: any) => void) => {
        const draft = { ...safeExam, questions: [...questions] };
        mutator(draft);
        onChange(draft);
    };

    const updateQuestion = (qIdx: number, mutator: (question: any) => void) => {
        updateExam((draft) => {
            if (!draft.questions[qIdx]) return;
            const question = { ...draft.questions[qIdx] };
            question.sub_questions = Array.isArray(question.sub_questions) ? [...question.sub_questions] : [];
            mutator(question);
            draft.questions[qIdx] = question;
        });
    };

    const updateSubQuestion = (qIdx: number, sqIdx: number, mutator: (sub: any) => void) => {
        updateQuestion(qIdx, (question) => {
            if (!question.sub_questions[sqIdx]) return;
            const nextSub = { ...question.sub_questions[sqIdx] };
            mutator(nextSub);
            question.sub_questions[sqIdx] = nextSub;
        });
    };

    const handleQuestionChange = (qIdx: number, content: string) => {
        updateQuestion(qIdx, (question) => {
            question.question_content = content;
        });
    };

    const handleSubQuestionContentChange = (qIdx: number, sqIdx: number, content: string) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            sub.question_content = content;
            sub.sub_question_content = content;
        });
    };

    const handleSubQuestionAnswerChange = (qIdx: number, sqIdx: number, content: string) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            sub.answer_content = content;
        });
    };

    const handleSubQuestionFormatChange = (qIdx: number, sqIdx: number, field: 'question' | 'answer', format: 0 | 1) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            if (field === 'question') {
                sub.question_format = format;
                sub.sub_question_format = format;
            } else {
                sub.answer_format = format;
            }
        });
    };

    const handleSubQuestionOptionsChange = (
        qIdx: number,
        sqIdx: number,
        options: Array<{ id: string; content: string; isCorrect: boolean }>,
    ) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            sub.options = options;
        });
    };

    const addQuestion = () => {
        const newQuestion = {
            id: `new-q-${Date.now()}`,
            question_number: questions.length + 1,
            question_content: '新しい大問',
            question_format: 0,
            sub_questions: [] as any[],
        };
        onChange({ ...safeExam, questions: [...questions, newQuestion] });
    };

    const addSubQuestion = (qIdx: number) => {
        updateQuestion(qIdx, (question) => {
            const subQuestions = question.sub_questions as any[];
            const nextNumber = subQuestions.length + 1;
            subQuestions.push({
                id: `new-sq-${Date.now()}`,
                sub_question_number: nextNumber,
                question_type_id: 1,
                sub_question_type_id: 1,
                question_content: '新しい小問',
                sub_question_content: '新しい小問',
                question_format: 0,
                answer_content: '',
                answer_format: 0,
                options: [],
            });
        });
    };

    const renderSubQuestionEditor = (sq: any, qIdx: number, sqIdx: number) => {
        const typeId = sq.sub_question_type_id ?? sq.question_type_id ?? sq.questionTypeId ?? 1;
        const EditComponent = editComponentLoaders[typeId] ?? ProblemTypeRegistry.getProblemTypeEdit(typeId);
        const normalizedProps: ProblemTypeEditProps = {
            subQuestionNumber: sq.sub_question_number ?? sq.subQuestionNumber ?? sqIdx + 1,
            questionContent: sq.sub_question_content ?? sq.question_content ?? '',
            questionFormat: (sq.sub_question_format ?? sq.question_format ?? 0) as 0 | 1,
            answerContent: sq.answer_content ?? '',
            answerFormat: (sq.answer_format ?? 0) as 0 | 1,
            options: sq.options ?? [],
            keywords: sq.keywords ?? [],
            onQuestionChange: (content) => handleSubQuestionContentChange(qIdx, sqIdx, content),
            onAnswerChange: (content) => handleSubQuestionAnswerChange(qIdx, sqIdx, content),
            onOptionsChange: (opts) => handleSubQuestionOptionsChange(qIdx, sqIdx, opts),
            onFormatChange: (field, format) => handleSubQuestionFormatChange(qIdx, sqIdx, field, format),
        };

        const label = questionTypeLabels[typeId] ?? '記述式';
        const content = EditComponent ? <EditComponent {...normalizedProps} /> : <FallbackEdit {...normalizedProps} />;

        return (
            <div key={sq.id || sqIdx} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-sm">
                        ({normalizedProps.subQuestionNumber})
                    </div>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{label}</span>
                </div>
                <Suspense fallback={<div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">編集UIを読み込み中...</div>}>
                    {content}
                </Suspense>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            {questions.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="space-y-6">
                    <QuestionBlock
                        questionNumber={q.question_number ?? q.questionNumber ?? qIdx + 1}
                        content={q.question_content ?? ''}
                        format={(q.question_format ?? 0) as 0 | 1}
                        canEdit={true}
                        onContentChange={(content) => handleQuestionChange(qIdx, content)}
                    />
                    <div className="space-y-4 pl-8">
                        {(q.sub_questions || []).map((sq: any, sqIdx: number) => renderSubQuestionEditor(sq, qIdx, sqIdx))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-dashed"
                            onClick={() => addSubQuestion(qIdx)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            小問を追加
                        </Button>
                    </div>
                </div>
            ))}

            <Button
                variant="ghost"
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={addQuestion}
            >
                <Plus className="mr-2 h-6 w-6" />
                大問を追加
            </Button>
        </div>
    );
}
