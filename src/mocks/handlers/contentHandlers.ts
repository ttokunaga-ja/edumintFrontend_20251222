import { http, HttpResponse } from 'msw';
import { mockExams, mockQuestions, mockSubQuestions } from '../mockData/content';

export const contentHandlers = [
  http.get('/api/exams/:id', ({ params }) => {
    const { id } = params;
    if (typeof id !== 'string') {
      return HttpResponse.json({ message: 'Invalid exam id' }, { status: 400 });
    }

    const exam = mockExams.find((e) => e.id === id);
    if (!exam) {
      return HttpResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    const questions = mockQuestions
      .filter((q) => q.examId === id)
      .map((q) => ({
        ...q,
        subQuestions: mockSubQuestions.filter((sq) => sq.questionId === q.id),
      }));

    const responseBody = Object.assign({}, exam, { questions });
    return HttpResponse.json(responseBody);
  }),

  http.patch('/api/exams/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Record<string, unknown>;
    console.log(`Updating exam ${id}:`, updates);
    return HttpResponse.json({ success: true, id, ...updates });
  }),
];
