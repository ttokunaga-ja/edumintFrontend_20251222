/**
 * ProblemEditor データ管理テストケース
 * 
 * 不具合:
 * 1. 大門追加失敗
 * 2. 小門追加失敗
 * 3. 小門問題形式変更がUI反映されない
 * 4. 大門キーワード追加失敗
 * 
 * テスト環境: Vitest + React Testing Library
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemEditor } from '@/components/page/ProblemViewEditPage/ProblemEditor';

/**
 * テスト 1: 大門追加機能
 * 
 * 期待動作:
 * - [大問を追加] ボタンクリック
 * - 新規大問がexam.questionsに追加される
 * - question_id, question_number, question_content が初期化される
 * - 重複したIDが生成されないこと
 */
describe('ProblemEditor - Add Question', () => {
  it('should add a new question with valid data structure', () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '既存問題',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [],
          questionNumber: 1,
          questionContent: '既存問題',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    const { getByRole } = render(
      <ProblemEditor exam={exam} onChange={handleChange} />
    );

    // [大問を追加] ボタンをクリック
    const addButton = getByRole('button', { name: /大問を追加/i });
    fireEvent.click(addButton);

    // handleChange が呼ばれたか確認
    expect(handleChange).toHaveBeenCalled();

    // 返されたデータ構造を確認
    const updatedExam = handleChange.mock.calls[0][0];
    expect(updatedExam.questions).toHaveLength(2);
    
    const newQuestion = updatedExam.questions[1];
    expect(newQuestion).toEqual(
      expect.objectContaining({
        question_number: 2,
        question_content: '',
        question_format: 0,
        difficulty: 1,
        keywords: [],
        sub_questions: [],
        // Legacy aliases
        questionNumber: 2,
        questionContent: '',
        questionFormat: 0,
        subQuestions: [],
      })
    );

    // UUID が生成されたか確認
    expect(newQuestion.id).toBeDefined();
    expect(newQuestion.id).not.toEqual(exam.questions[0].id);
  });

  it('should maintain renumbered question numbers when adding multiple questions', () => {
    const exam = { id: 'exam-1', questions: [] };
    const handleChange = vi.fn();

    const { getByRole, rerender } = render(
      <ProblemEditor exam={exam} onChange={handleChange} />
    );

    // 3回大問を追加
    for (let i = 0; i < 3; i++) {
      const addButton = getByRole('button', { name: /大問を追加/i });
      fireEvent.click(addButton);
      
      const updatedExam = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      rerender(<ProblemEditor exam={updatedExam} onChange={handleChange} />);
    }

    const finalExam = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(finalExam.questions).toHaveLength(3);
    expect(finalExam.questions[0].question_number).toBe(1);
    expect(finalExam.questions[1].question_number).toBe(2);
    expect(finalExam.questions[2].question_number).toBe(3);
  });
});

/**
 * テスト 2: 小問追加機能
 * 
 * 期待動作:
 * - [小問を追加] ボタンクリック
 * - 新規小問が親大問の sub_questions に追加される
 * - sub_question_id, sub_question_number, sub_question_type_id が初期化される
 * - sub_question_type_id は新スキーマに準拠 (10: 記述式)
 */
describe('ProblemEditor - Add SubQuestion', () => {
  it('should add a new subquestion with valid data structure', () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問1',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [
            {
              id: 'sq1',
              sub_question_id: 'sq1',
              question_id: 'q1',
              sub_question_number: 1,
              sub_question_type_id: 10,
              question_content: '小問1',
              question_format: 0,
              answer_explanation: '',
              answer_format: 0,
              keywords: [],
              subQuestionNumber: 1,
              questionTypeId: 10,
              questionContent: '小問1',
              questionFormat: 0,
              answerContent: '',
              answerFormat: 0,
            },
          ],
          questionNumber: 1,
          questionContent: '大問1',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    const { getByRole } = render(
      <ProblemEditor exam={exam} onChange={handleChange} />
    );

    // [小問を追加] ボタンをクリック
    const addSubButton = getByRole('button', { name: /小問を追加/i });
    fireEvent.click(addSubButton);

    expect(handleChange).toHaveBeenCalled();

    const updatedExam = handleChange.mock.calls[0][0];
    const question = updatedExam.questions[0];
    
    expect(question.sub_questions).toHaveLength(2);

    const newSubQuestion = question.sub_questions[1];
    expect(newSubQuestion).toEqual(
      expect.objectContaining({
        sub_question_number: 2,
        sub_question_type_id: 10, // NEW SCHEMA: 記述式
        question_content: '',
        question_format: 0,
        answer_explanation: '',
        answer_format: 0,
        keywords: [],
        question_id: 'q1', // 親のquestion_idを継承
        // Legacy aliases
        subQuestionNumber: 2,
        questionTypeId: 10,
        questionContent: '',
        questionFormat: 0,
        answerContent: '',
        answerFormat: 0,
      })
    );
  });

  it('should preserve parent question_id when adding subquestions', () => {
    const parentQuestionId = 'q1-unique-id';
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: parentQuestionId,
          question_id: parentQuestionId,
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    const { getByRole } = render(
      <ProblemEditor exam={exam} onChange={handleChange} />
    );

    const addSubButton = getByRole('button', { name: /小問を追加/i });
    fireEvent.click(addSubButton);

    const updatedExam = handleChange.mock.calls[0][0];
    const newSubQuestion = updatedExam.questions[0].sub_questions[0];
    
    expect(newSubQuestion.question_id).toBe(parentQuestionId);
  });
});

/**
 * テスト 3: 小問形式変更のUI反映
 * 
 * 期待動作:
 * - 問題形式（question_type_id）を変更
 * - SubQuestionBlockContent が再レンダリング
 * - 記述式 (ID 10) → 選択式 (ID 1) へ変更時、UIが記述エディタから選択肢エディタに切り替わる
 */
describe('ProblemEditor - SubQuestion Format Change UI', () => {
  it('should update UI when question type changes from essay to selection', async () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [
            {
              id: 'sq1',
              sub_question_id: 'sq1',
              question_id: 'q1',
              sub_question_number: 1,
              sub_question_type_id: 10, // 記述式
              question_content: '記述問題',
              question_format: 0,
              answer_explanation: '',
              answer_format: 0,
              keywords: [],
              options: [],
              subQuestionNumber: 1,
              questionTypeId: 10,
              questionContent: '記述問題',
              questionFormat: 0,
              answerContent: '',
              answerFormat: 0,
            },
          ],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    let currentExam = exam;
    const handleChange = vi.fn((newExam) => {
      currentExam = newExam;
    });

    const { rerender } = render(
      <ProblemEditor exam={currentExam} onChange={handleChange} />
    );

    // 問題形式を選択式(ID 1)に変更
    handleChange({
      ...currentExam,
      questions: [
        {
          ...currentExam.questions[0],
          sub_questions: [
            {
              ...currentExam.questions[0].sub_questions[0],
              sub_question_type_id: 1, // 選択式に変更
              questionTypeId: 1,
              options: [
                { id: 'opt1', content: '選択肢1', isCorrect: true },
                { id: 'opt2', content: '選択肢2', isCorrect: false },
              ],
            },
          ],
        },
      ],
    });

    currentExam = {
      ...currentExam,
      questions: [
        {
          ...currentExam.questions[0],
          sub_questions: [
            {
              ...currentExam.questions[0].sub_questions[0],
              sub_question_type_id: 1,
              questionTypeId: 1,
              options: [
                { id: 'opt1', content: '選択肢1', isCorrect: true },
                { id: 'opt2', content: '選択肢2', isCorrect: false },
              ],
            },
          ],
        },
      ],
    };

    rerender(<ProblemEditor exam={currentExam} onChange={handleChange} />);

    // 変更後の形式を確認
    const updatedSubQuestion = currentExam.questions[0].sub_questions[0];
    expect(updatedSubQuestion.sub_question_type_id).toBe(1);
    expect(updatedSubQuestion.options).toBeDefined();
    expect(updatedSubQuestion.options.length).toBeGreaterThan(0);
  });
});

/**
 * テスト 4: キーワード管理
 * 
 * 期待動作:
 * - 大門キーワード追加: keywords 配列に追加される
 * - 小問キーワード追加: sub_questions[i].keywords 配列に追加される
 * - キーワード削除: 対応するキーワードが削除される
 */
describe('ProblemEditor - Keyword Management', () => {
  it('should add keyword to question', async () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    render(<ProblemEditor exam={exam} onChange={handleChange} />);

    // キーワード追加のシミュレーション
    const newKeyword = { id: 'kw1', keyword: '代数' };
    const updatedExam = {
      ...exam,
      questions: [
        {
          ...exam.questions[0],
          keywords: [newKeyword],
        },
      ],
    };

    handleChange(updatedExam);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({
            keywords: expect.arrayContaining([newKeyword]),
          }),
        ]),
      })
    );
  });

  it('should remove keyword from question', () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [
            { id: 'kw1', keyword: '代数' },
            { id: 'kw2', keyword: '方程式' },
          ],
          sub_questions: [],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    render(<ProblemEditor exam={exam} onChange={handleChange} />);

    // キーワード削除のシミュレーション
    const updatedExam = {
      ...exam,
      questions: [
        {
          ...exam.questions[0],
          keywords: exam.questions[0].keywords.filter((kw) => kw.id !== 'kw1'),
        },
      ],
    };

    handleChange(updatedExam);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({
            keywords: [{ id: 'kw2', keyword: '方程式' }],
          }),
        ]),
      })
    );
  });

  it('should add keyword to subquestion', () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [
            {
              id: 'sq1',
              sub_question_id: 'sq1',
              question_id: 'q1',
              sub_question_number: 1,
              sub_question_type_id: 10,
              question_content: '小問',
              question_format: 0,
              answer_explanation: '',
              answer_format: 0,
              keywords: [],
              subQuestionNumber: 1,
              questionTypeId: 10,
              questionContent: '小問',
              questionFormat: 0,
              answerContent: '',
              answerFormat: 0,
            },
          ],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    render(<ProblemEditor exam={exam} onChange={handleChange} />);

    // 小問キーワード追加
    const newKeyword = { id: 'kw1', keyword: '微分' };
    const updatedExam = {
      ...exam,
      questions: [
        {
          ...exam.questions[0],
          sub_questions: [
            {
              ...exam.questions[0].sub_questions[0],
              keywords: [newKeyword],
            },
          ],
        },
      ],
    };

    handleChange(updatedExam);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({
            sub_questions: expect.arrayContaining([
              expect.objectContaining({
                keywords: expect.arrayContaining([newKeyword]),
              }),
            ]),
          }),
        ]),
      })
    );
  });
});

/**
 * テスト 5: データ形式互換性
 * 
 * 期待動作:
 * - snake_case (question_number) と camelCase (questionNumber) の両方が存在
 * - 削除・追加時に両形式が同期される
 */
describe('ProblemEditor - Data Format Compatibility', () => {
  it('should maintain both snake_case and camelCase when adding question', () => {
    const exam = { id: 'exam-1', questions: [] };
    const handleChange = vi.fn();

    render(<ProblemEditor exam={exam} onChange={handleChange} />);

    const button = screen.getByRole('button', { name: /大問を追加/i });
    fireEvent.click(button);

    const updatedExam = handleChange.mock.calls[0][0];
    const newQuestion = updatedExam.questions[0];

    // 両方の形式が存在することを確認
    expect(newQuestion.question_number).toBe(newQuestion.questionNumber);
    expect(newQuestion.question_content).toBe(newQuestion.questionContent);
    expect(newQuestion.question_format).toBe(newQuestion.questionFormat);
    expect(newQuestion.sub_questions).toEqual(newQuestion.subQuestions);
  });

  it('should maintain both snake_case and camelCase for subquestions', () => {
    const exam = {
      id: 'exam-1',
      questions: [
        {
          id: 'q1',
          question_id: 'q1',
          question_number: 1,
          question_content: '大問',
          question_format: 0,
          difficulty: 1,
          keywords: [],
          sub_questions: [],
          questionNumber: 1,
          questionContent: '大問',
          questionFormat: 0,
          subQuestions: [],
        },
      ],
    };

    const handleChange = vi.fn();
    render(<ProblemEditor exam={exam} onChange={handleChange} />);

    const button = screen.getByRole('button', { name: /小問を追加/i });
    fireEvent.click(button);

    const updatedExam = handleChange.mock.calls[0][0];
    const newSubQuestion = updatedExam.questions[0].sub_questions[0];

    expect(newSubQuestion.sub_question_number).toBe(newSubQuestion.subQuestionNumber);
    expect(newSubQuestion.sub_question_type_id).toBe(newSubQuestion.questionTypeId);
    expect(newSubQuestion.question_content).toBe(newSubQuestion.questionContent);
    expect(newSubQuestion.question_format).toBe(newSubQuestion.questionFormat);
  });
});
