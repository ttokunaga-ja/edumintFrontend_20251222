import React, { useEffect } from 'react';
import { Button } from '@/components/primitives/button';
import { Plus } from 'lucide-react';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import { QuestionSectionEdit } from '../ProblemViewEditPage/QuestionSectionEdit';
import { QuestionSectionView } from '../ProblemViewEditPage/QuestionSectionView';
// Import lazy loaded components as they are used in QuestionSectionEdit or here
// Actually editComponentLoaders is defined locally in ProblemEditor, need to duplicate or export it.
// For now, duplicating to decouple as requested.

export interface StructureAnalysisEditorProps {
    exam: any;
    onChange: (exam: any) => void;
    canEdit?: boolean;
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

export function StructureAnalysisEditor({ exam, onChange, canEdit = true }: StructureAnalysisEditorProps) {
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

    const handleQuestionFormatChange = (qIdx: number, format: 0 | 1) => {
        updateQuestion(qIdx, (question) => {
            question.question_format = format;
        });
    };

    const handleQuestionDifficultyChange = (qIdx: number, value: number) => {
        updateQuestion(qIdx, (question) => {
            question.difficulty = value;
        });
    };

    const handleQuestionKeywordAdd = (qIdx: number, keyword: string) => {
        updateQuestion(qIdx, (question) => {
            const keywords = Array.isArray(question.keywords) ? [...question.keywords] : [];
            keywords.push({ id: `kw-${Date.now()}`, keyword });
            question.keywords = keywords;
        });
    };

    const handleQuestionKeywordRemove = (qIdx: number, keywordId: string) => {
        updateQuestion(qIdx, (question) => {
            const keywords = Array.isArray(question.keywords) ? question.keywords.filter((k: any) => k.id !== keywordId) : [];
            question.keywords = keywords;
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

    const handleSubQuestionKeywordAdd = (qIdx: number, sqIdx: number, keyword: string) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            const keywords = Array.isArray(sub.keywords) ? [...sub.keywords] : [];
            keywords.push({ id: `sqkw-${Date.now()}`, keyword });
            sub.keywords = keywords;
        });
    };

    const handleSubQuestionKeywordRemove = (qIdx: number, sqIdx: number, keywordId: string) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            const keywords = Array.isArray(sub.keywords) ? sub.keywords.filter((k: any) => k.id !== keywordId) : [];
            sub.keywords = keywords;
        });
    };

    const handleSubQuestionTypeChange = (qIdx: number, sqIdx: number, typeId: number) => {
        updateSubQuestion(qIdx, sqIdx, (sub) => {
            sub.sub_question_type_id = typeId;
            sub.question_type_id = typeId;
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

    return (
        <div className="space-y-12">
            {questions.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="space-y-6">
                    {canEdit ? (
                        <>
                            <QuestionSectionEdit
                                question={q}
                                onQuestionChange={(content) => handleQuestionChange(qIdx, content)}
                                onQuestionFormatChange={(f) => handleQuestionFormatChange(qIdx, f)}
                                onQuestionDifficultyChange={(d) => handleQuestionDifficultyChange(qIdx, d)}
                                onQuestionKeywordAdd={(kw) => handleQuestionKeywordAdd(qIdx, kw)}
                                onQuestionKeywordRemove={(kwId) => handleQuestionKeywordRemove(qIdx, kwId)}
                                onSubQuestionChange={(sqIdx, content) => handleSubQuestionContentChange(qIdx, sqIdx, content)}
                                onSubAnswerChange={(sqIdx, content) => handleSubQuestionAnswerChange(qIdx, sqIdx, content)}
                                onSubOptionsChange={(sqIdx, opts) => handleSubQuestionOptionsChange(qIdx, sqIdx, opts)}
                                onSubFormatChange={(sqIdx, field, format) => handleSubQuestionFormatChange(qIdx, sqIdx, field, format)}
                                onSubKeywordAdd={(sqIdx, kw) => handleSubQuestionKeywordAdd(qIdx, sqIdx, kw)}
                                onSubKeywordRemove={(sqIdx, kwId) => handleSubQuestionKeywordRemove(qIdx, sqIdx, kwId)}
                                onSubTypeChange={(sqIdx, type) => handleSubQuestionTypeChange(qIdx, sqIdx, type)}
                                editComponentLoaders={editComponentLoaders}
                                viewMode="structure" // Fixed to structure mode
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-dashed ml-8"
                                onClick={() => addSubQuestion(qIdx)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                小問を追加
                            </Button>
                        </>
                    ) : (
                        <QuestionSectionView question={q} />
                    )}
                </div>
            ))}

            {canEdit && (
                <Button
                    variant="ghost"
                    className="w-full rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={addQuestion}
                >
                    <Plus className="mr-2 h-6 w-6" />
                    大問を追加
                </Button>
            )}
        </div>
    );
}
