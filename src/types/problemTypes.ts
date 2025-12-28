export type ProblemTypeViewProps = { subQuestionNumber: number; questionContent: string; questionFormat: 0 | 1; answerContent?: string; answerFormat?: 0 | 1; options?: Array<{ id: string; content: string; isCorrect: boolean }>; keywords?: Array<{ id: string; keyword: string }>; showAnswer?: boolean;
}; export type ProblemTypeEditProps = ProblemTypeViewProps & { onQuestionChange?: (content: string) => void; onAnswerChange?: (content: string) => void; onOptionsChange?: (options: Array<{ id: string; content: string; isCorrect: boolean }>) => void; onFormatChange?: (field: 'question' | 'answer', format: 0 | 1) => void;
}; export type ProblemTypeRegistration = { id: number; view: React.ComponentType<ProblemTypeViewProps>; edit?: React.ComponentType<ProblemTypeEditProps>;
};
