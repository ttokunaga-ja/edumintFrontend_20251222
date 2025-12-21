import React from 'react';
import { QuestionBlock } from './QuestionBlock';
import { SubQuestionBlock } from './SubQuestionBlock';
import { Button } from '@/components/primitives/button';
import { Plus } from 'lucide-react';

export interface ProblemEditorProps {
    exam: any;
    onChange: (exam: any) => void;
}

export function ProblemEditor({ exam, onChange }: ProblemEditorProps) {
    const handleQuestionChange = (qIdx: number, content: string) => {
        const newExam = { ...exam };
        newExam.questions[qIdx].question_content = content;
        onChange(newExam);
    };

    const handleSubQuestionChange = (qIdx: number, sqIdx: number, field: string, content: string) => {
        const newExam = { ...exam };
        newExam.questions[qIdx].sub_questions[sqIdx][field] = content;
        onChange(newExam);
    };

    const addQuestion = () => {
        const newExam = { ...exam };
        newExam.questions.push({
            id: `new-q-${Date.now()}`,
            question_number: newExam.questions.length + 1,
            question_content: '新しい大問',
            question_format: 0,
            sub_questions: []
        });
        onChange(newExam);
    };

    return (
        <div className="space-y-12">
            {exam.questions.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="space-y-6">
                    <QuestionBlock
                        questionNumber={q.question_number}
                        content={q.question_content}
                        format={q.question_format}
                        canEdit={true}
                        onContentChange={(content) => handleQuestionChange(qIdx, content)}
                    />
                    <div className="pl-8 space-y-4">
                        {q.sub_questions.map((sq: any, sqIdx: number) => (
                            <SubQuestionBlock
                                key={sq.id || sqIdx}
                                subQuestionNumber={sq.sub_question_number}
                                questionTypeId={sq.question_type_id || 1}
                                questionContent={sq.question_content}
                                questionFormat={sq.question_format || 0}
                                answerContent={sq.answer_content}
                                canEdit={true}
                                onQuestionChange={(content) => handleSubQuestionChange(qIdx, sqIdx, 'question_content', content)}
                                onAnswerChange={(content) => handleSubQuestionChange(qIdx, sqIdx, 'answer_content', content)}
                            />
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-dashed"
                            onClick={() => {
                                const newExam = { ...exam };
                                newExam.questions[qIdx].sub_questions.push({
                                    id: `new-sq-${Date.now()}`,
                                    sub_question_number: newExam.questions[qIdx].sub_questions.length + 1,
                                    question_content: '新しい小問',
                                    question_type_id: 1,
                                    answer_content: ''
                                });
                                onChange(newExam);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            小問を追加
                        </Button>
                    </div>
                </div>
            ))}

            <Button
                variant="ghost"
                className="w-full py-8 border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-all rounded-xl"
                onClick={addQuestion}
            >
                <Plus className="w-6 h-6 mr-2" />
                大問を追加
            </Button>
        </div>
    );
}
