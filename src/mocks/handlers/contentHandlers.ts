import { http, HttpResponse } from 'msw';
import {
  mockExams,
  mockQuestions,
  mockSubQuestions,
  mockSubQuestionSelection,
  mockSubQuestionMatching,
  mockSubQuestionOrdering,
  mockSubQuestionEssay,
  mockAcademicFields,
  mockFaculties,
} from '../data';
import { createdExams } from '../db';

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "http://localhost:3000/api";
const withBase = (path: string) => `${apiBase}${path}`;

export const contentHandlers = [
  http.get(withBase('/exams/:id'), ({ params }) => {
    const { id } = params;
    if (typeof id !== 'string') {
      return HttpResponse.json({ message: 'Invalid exam id' }, { status: 400 });
    }

    const normalizedId = id;
    const fallbackId = id.startsWith('exam-') ? id.replace('exam-', '') : `exam-${id}`;
    const allExams = [...mockExams, ...createdExams];
    const exam = allExams.find((e) => e.id === normalizedId) || allExams.find((e) => e.id === fallbackId);

    if (!exam) {
      return HttpResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    // exam.questions が存在する場合はそれを使用、そうでない場合はmockQuestionsから構築
    const questions = exam.questions ? exam.questions : mockQuestions
      .filter((q) => q.problemId === exam.id)
      .map((q) => ({
        ...q,
        subQuestions: mockSubQuestions
          .filter((sq) => sq.questionId === q.id)
          .map((sq) => {
            // 問題形式に応じて関連データを追加
            const subQData: any = {
              ...sq,
            };

            // ID 0-2: 単一選択、複数選択、正誤判定 (shifted to 0-based)
            if ([0, 1, 2].includes(sq.questionTypeId)) {
              subQData.options = mockSubQuestionSelection
                .filter((sel) => sel.subQuestionId === sq.id)
                .map((sel) => ({
                  id: sel.id,
                  content: sel.content,
                  isCorrect: sel.isCorrect,
                }));
            }

            // ID 3: マッチング（組み合わせ） (was 4)
            if (sq.questionTypeId === 3) {
              subQData.pairs = mockSubQuestionMatching
                .filter((match) => match.subQuestionId === sq.id)
                .map((match) => ({
                  id: match.id,
                  question: match.leftContent,
                  answer: match.rightContent,
                }));
            }

            // ID 4: 順序並べ替え (was 5)
            if (sq.questionTypeId === 4) {
              subQData.items = mockSubQuestionOrdering
                .filter((ord) => ord.subQuestionId === sq.id)
                .map((ord) => ({
                  id: ord.id,
                  text: ord.content,
                  correctOrder: ord.correctOrder,
                }));
            }

            // ID 10-14: 記述系（essays）
            if ([10, 11, 12, 13, 14].includes(sq.questionTypeId)) {
              subQData.answers = mockSubQuestionEssay
                .filter((essay) => essay.subQuestionId === sq.id)
                .map((essay) => ({
                  id: essay.id,
                  sampleAnswer: essay.sampleAnswer,
                  gradingCriteria: essay.gradingCriteria,
                  pointValue: essay.pointValue,
                }));
            }

            return subQData;
          }),
      }));

    const responseBody = Object.assign({}, exam, {
      questions,
    });

    return HttpResponse.json(responseBody);
  }),

  http.get(withBase('/exams/template'), () => {
    const exam = mockExams[0];
    const questions = mockQuestions
      .filter((q) => q.problemId === exam.id)
      .map((q) => ({
        ...q,
        subQuestions: mockSubQuestions
          .filter((sq) => sq.questionId === q.id)
          .map((sq) => {
            // 問題形式に応じて関連データを追加
            const subQData: any = {
              ...sq,
            };

            // ID 0-2: 単一選択、複数選択、正誤判定 (shifted to 0-based)
            if ([0, 1, 2].includes(sq.questionTypeId)) {
              subQData.options = mockSubQuestionSelection
                .filter((sel) => sel.subQuestionId === sq.id)
                .map((sel) => ({
                  id: sel.id,
                  content: sel.content,
                  isCorrect: sel.isCorrect,
                }));
            }

            // ID 3: マッチング（組み合わせ） (was 4)
            if (sq.questionTypeId === 3) {
              subQData.pairs = mockSubQuestionMatching
                .filter((match) => match.subQuestionId === sq.id)
                .map((match) => ({
                  id: match.id,
                  question: match.leftContent,
                  answer: match.rightContent,
                }));
            }

            // ID 4: 順序並べ替え (was 5)
            if (sq.questionTypeId === 4) {
              subQData.items = mockSubQuestionOrdering
                .filter((ord) => ord.subQuestionId === sq.id)
                .map((ord) => ({
                  id: ord.id,
                  text: ord.content,
                  correctOrder: ord.correctOrder,
                }));
            }

            // ID 10-14: 記述系（essays）
            if ([10, 11, 12, 13, 14].includes(sq.questionTypeId)) {
              subQData.answers = mockSubQuestionEssay
                .filter((essay) => essay.subQuestionId === sq.id)
                .map((essay) => ({
                  id: essay.id,
                  sampleAnswer: essay.sampleAnswer,
                  gradingCriteria: essay.gradingCriteria,
                  pointValue: essay.pointValue,
                }));
            }

            return subQData;
          }),
      }));
    return HttpResponse.json({ ...exam, questions });
  }),

  http.patch(withBase('/exams/:id'), async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Record<string, unknown>;
    console.log(`Updating exam ${id}:`, updates);
    return HttpResponse.json({ success: true, id, ...updates });
  }),

  http.put(withBase('/exams/:id'), async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Record<string, unknown>;
    const normalizedId = typeof id === 'string' ? id : '';
    const fallbackId = normalizedId.startsWith('exam-') ? normalizedId.replace('exam-', '') : `exam-${normalizedId}`;
    const allExams = [...mockExams, ...createdExams];
    const existing = allExams.find((e) => e.id === normalizedId) || allExams.find((e) => e.id === fallbackId) || {};
    const merged = Object.assign({}, existing, updates);
    return HttpResponse.json(merged, { status: 200 });
  }),

  // マスタデータエンドポイント
  http.get(withBase('/academic-fields'), () => {
    return HttpResponse.json(mockAcademicFields);
  }),

  http.get(withBase('/faculties'), () => {
    return HttpResponse.json(mockFaculties);
  }),
];
