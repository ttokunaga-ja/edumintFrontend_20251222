import { http, HttpResponse } from 'msw';
import { mockExams, mockQuestions, mockSubQuestions } from '../mockData/content';

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

export const contentHandlers = [
  http.get(withBase('/exams/:id'), ({ params }) => {
    const { id } = params;
    if (typeof id !== 'string') {
      return HttpResponse.json({ message: 'Invalid exam id' }, { status: 400 });
    }

    const normalizedId = id;
    const fallbackId = id.startsWith('exam-') ? id.replace('exam-', '') : `exam-${id}`;
    const exam = mockExams.find((e) => e.id === normalizedId) || mockExams.find((e) => e.id === fallbackId);

    if (!exam) {
      return HttpResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    const questions = mockQuestions
      .filter((q) => q.examId === exam.id)
      .map((q) => ({
        ...q,
        question_number: q.questionNumber,
        question_content: q.questionContent,
        question_format: q.questionFormat,
        sub_questions: mockSubQuestions
          .filter((sq) => sq.questionId === q.id)
          .map((sq) => ({
            ...sq,
            sub_question_number: sq.subQuestionNumber,
            question_type_id: sq.questionTypeId,
            question_content: sq.questionContent,
            question_format: sq.questionFormat,
            answer_content: sq.answerContent,
            answer_format: sq.answerFormat,
          })),
      }));

    const responseBody = Object.assign({}, exam, {
      questions,
    });

    return HttpResponse.json(responseBody);
  }),

  http.patch(withBase('/exams/:id'), async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Record<string, unknown>;
    console.log(`Updating exam ${id}:`, updates);
    return HttpResponse.json({ success: true, id, ...updates });
  }),
];
