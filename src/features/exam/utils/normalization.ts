/**
 * APIデータとフォームデータの変換層
 * 
 * DB（またはBackend API）のデータ構造（スネークケース、数値ID）と、
 * フロントエンドのフォーム用スキーマ（キャメルケース、一時ID化）には
 * 必ずギャップが存在します。
 * 
 * この2つの関数で往復変換を行います。
 */

import type { ExamFormValues, Question, SubQuestion } from './schema';

/**
 * APIレスポンス（スネークケース、数値ID）
 * をフォーム用スキーマ（キャメルケース、一時ID化）に変換
 * 
 * @param apiData - サーバーから取得した試験データ
 * @returns フォーム操作用のデータ
 */
export function transformToForm(apiData: any): ExamFormValues {
  if (!apiData) {
    return {
      id: '',
      examName: '',
      examYear: new Date().getFullYear(),
      school: '',
      universityName: '',
      facultyName: '',
      teacherName: '',
      subjectName: '',
      examType: 0,
      level: '',
      durationMinutes: 0,
      academicFieldName: '',
      majorType: 0,
      questions: [],
    };
  }

  // Difficulty の抽出ヘルパー
  const extractDifficulty = (d: any) => {
    if (typeof d === 'object' && d !== null) {
      if (d.level !== undefined) return d.level.toString();
      if (d.id !== undefined) return d.id.toString();
      return '2';
    }
    return d?.toString() || '2';
  };

  return {
    id: apiData.id?.toString() || '',
    examName: apiData.exam_name || apiData.examName || '',
    examYear: apiData.exam_year || apiData.examYear || new Date().getFullYear(),

    // 追加のメタデータ
    school: apiData.school || '',
    universityName: apiData.university_name || apiData.universityName || '',
    facultyName: apiData.faculty_name || apiData.facultyName || '',
    teacherName: apiData.teacher_name || apiData.teacherName || '',
    subjectName: apiData.subject_name || apiData.subjectName || '',
    examType: apiData.exam_type !== undefined ? apiData.exam_type : (apiData.examType || 0),
    level: apiData.level || '',
    durationMinutes: apiData.duration_minutes || apiData.durationMinutes || 0,
    academicFieldName: apiData.academic_field_name || apiData.academicFieldName || '',
    majorType: apiData.major_type !== undefined ? apiData.major_type : (apiData.majorType || 0),

    questions: (apiData.questions || []).map((q: any, qIdx: number): Question => ({
      id: q.id?.toString() || `temp-q-${qIdx}`,
      questionNumber: q.question_number || q.questionNumber || qIdx + 1,
      questionContent: q.content || q.question_content || q.questionContent || '',
      difficulty: extractDifficulty(q.difficulty),
      keywords: (q.keywords || []).map((kw: any, kwIdx: number) => ({
        id: kw.id?.toString() || `temp-kw-q${qIdx}-${kwIdx}`,
        keyword: kw.keyword || '',
      })),

      subQuestions: (q.sub_questions || q.subQuestions || []).map((sq: any, sqIdx: number): SubQuestion => ({
        id: sq.id?.toString() || `temp-sq-q${qIdx}-${sqIdx}`,
        subQuestionNumber: sq.sub_question_number || sq.subQuestionNumber || sqIdx + 1,
        questionTypeId: (sq.question_type_id?.toString() || sq.questionTypeId?.toString()) || '1',
        questionContent: sq.content || sq.question_content || sq.questionContent || '',
        answerContent: sq.answer_content || sq.answerContent || sq.answer || '',
        explanation: sq.explanation || sq.answer_explanation || sq.answerExplanation || '',
        keywords: (sq.keywords || []).map((kw: any, kwIdx: number) => ({
          id: kw.id?.toString() || `temp-kw-q${qIdx}-sq${sqIdx}-${kwIdx}`,
          keyword: kw.keyword || '',
        })),

        // フォーマット別データ
        options: (sq.sub_question_selection || sq.options || []).map((opt: any, optIdx: number) => ({
          id: opt.id?.toString() || `temp-opt-q${qIdx}-sq${sqIdx}-${optIdx}`,
          content: opt.content || '',
          isCorrect: opt.is_correct !== undefined ? opt.is_correct : opt.isCorrect || false,
        })),
        pairs: (sq.sub_question_matching || sq.pairs || []).map((pair: any, pIdx: number) => ({
          id: pair.id?.toString() || `temp-pair-q${qIdx}-sq${sqIdx}-${pIdx}`,
          question: pair.question || pair.leftContent || '',
          answer: pair.answer || pair.rightContent || '',
        })),
        items: (sq.sub_question_ordering || sq.items || []).map((item: any, iIdx: number) => ({
          id: item.id?.toString() || `temp-item-q${qIdx}-sq${sqIdx}-${iIdx}`,
          text: item.text || item.content || '',
          correctOrder: item.correct_order || item.correctOrder || 0,
        })),
        answers: (sq.sub_question_essay || sq.answers || []).map((ans: any, aIdx: number) => ({
          id: ans.id?.toString() || `temp-ans-q${qIdx}-sq${sqIdx}-${aIdx}`,
          sampleAnswer: ans.sample_answer || ans.sampleAnswer || '',
          gradingCriteria: ans.grading_criteria || ans.gradingCriteria || '',
          pointValue: ans.point_value || ans.pointValue || 0,
        })),
      })),
    })),
  };
}

/**
 * フォーム用スキーマ（キャメルケース、一時ID）
 * をAPIペイロード（スネークケース、IDフィルタリング）に変換
 * 
 * @param formData - React Hook Form のフォーム値
 * @returns API送信用のペイロード
 */
export function transformToApi(formData: ExamFormValues): any {
  // temp-* で始まるID（フロントエンド発行）は除去
  const isTemporaryId = (id: string | undefined) => !id || id.startsWith('temp-');

  return {
    id: isTemporaryId(formData.id) ? undefined : formData.id,
    exam_name: formData.examName,
    exam_year: formData.examYear,

    // 追加のメタデータ
    school: formData.school,
    university_name: formData.universityName,
    faculty_name: formData.facultyName,
    teacher_name: formData.teacherName,
    subject_name: formData.subjectName,
    exam_type: formData.examType,
    level: formData.level,
    duration_minutes: formData.durationMinutes,
    academic_field_name: formData.academicFieldName,
    major_type: formData.majorType,

    questions: formData.questions.map((q) => ({
      id: isTemporaryId(q.id) ? undefined : q.id,
      question_number: q.questionNumber,
      question_content: q.questionContent,
      difficulty: Number(q.difficulty),
      keywords: q.keywords
        .filter(kw => kw.keyword.trim())
        .map(kw => ({
          id: isTemporaryId(kw.id) ? undefined : kw.id,
          keyword: kw.keyword,
        })),

      sub_questions: q.subQuestions.map((sq) => ({
        id: isTemporaryId(sq.id) ? undefined : sq.id,
        sub_question_number: sq.subQuestionNumber,
        question_type_id: Number(sq.questionTypeId),
        question_content: sq.questionContent,
        answer_content: sq.answerContent,
        explanation: sq.explanation,
        keywords: sq.keywords
          .filter(kw => kw.keyword.trim())
          .map(kw => ({
            id: isTemporaryId(kw.id) ? undefined : kw.id,
            keyword: kw.keyword,
          })),

        // フォーマット別データ（選択肢など）
        sub_question_selection: sq.options?.map(opt => ({
          id: isTemporaryId(opt.id) ? undefined : opt.id,
          content: opt.content,
          is_correct: opt.isCorrect,
        })) || [],
        sub_question_matching: sq.pairs?.map(pair => ({
          id: isTemporaryId(pair.id) ? undefined : pair.id,
          question: pair.question,
          answer: pair.answer,
        })) || [],
        sub_question_ordering: sq.items?.map(item => ({
          id: isTemporaryId(item.id) ? undefined : item.id,
          text: item.text,
          correct_order: item.correctOrder,
        })) || [],
        sub_question_essay: sq.answers?.map(ans => ({
          id: isTemporaryId(ans.id) ? undefined : ans.id,
          sample_answer: ans.sampleAnswer,
          grading_criteria: ans.gradingCriteria,
          point_value: ans.pointValue,
        })) || [],
      })),
    })),
  };
}
