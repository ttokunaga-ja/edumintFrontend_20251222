import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { QuestionBlock } from './QuestionBlock';
import { SubQuestionBlock } from './SubQuestionBlock';

export interface ProblemEditorProps {
  exam: any;
  onChange: (exam: any) => void;
}

/**
 * ProblemEditor
 * 
 * 大門・小問の管理エディタ
 * 
 * DB スキーマの準拠:
 * - question_id: 大問ID（UUID）
 * - question_number: 大問番号（採番）
 * - question_content: 大問文
 * - question_format: 形式（0: MD, 1: LaTeX）
 * - difficulty: 難易度ID
 * - keywords: キーワード配列
 * - sub_questions: 小問配列
 *   - sub_question_id: 小問ID（UUID）
 *   - sub_question_number: 小問番号（採番）
 *   - sub_question_type_id: 問題形式ID（1-5, 10-14）
 *   - question_content: 小問文
 *   - answer_explanation: 解答解説
 */
export function ProblemEditor({ exam, onChange }: ProblemEditorProps) {
  const safeExam = exam ?? { questions: [] };

  const handleAddQuestion = () => {
    // DB スキーマに準拠: question_id はUUID
    const newQuestion = {
      id: crypto.randomUUID(), // question_id
      question_id: crypto.randomUUID(), // explicit question_id for clarity
      question_number: (safeExam.questions?.length || 0) + 1,
      question_content: '',
      question_format: 0,
      difficulty: 1, // Default to 1 (基礎)
      keywords: [],
      sub_questions: [],
      // Legacy aliases for compatibility
      questionNumber: (safeExam.questions?.length || 0) + 1,
      questionContent: '',
      questionFormat: 0,
      subQuestions: [],
    };
    const newQuestions = [...(safeExam.questions || []), newQuestion];
    onChange({ ...safeExam, questions: newQuestions });
  };

  const handleQuestionChange = (qIndex: number, updates: any) => {
    const newQuestions = [...safeExam.questions];
    newQuestions[qIndex] = { ...newQuestions[qIndex], ...updates };
    onChange({ ...safeExam, questions: newQuestions });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    const newQuestions = safeExam.questions.filter((_: any, i: number) => i !== qIndex);
    // 削除後、大問番号を再採番
    const renumberedQuestions = newQuestions.map((q: any, idx: number) => ({
      ...q,
      question_number: idx + 1,
      questionNumber: idx + 1,
    }));
    onChange({ ...safeExam, questions: renumberedQuestions });
  };

  const handleAddSubQuestion = (qIndex: number) => {
    const newQuestions = [...safeExam.questions];
    const question = newQuestions[qIndex];

    // DB スキーマに準拠: sub_question_id はUUID、sub_question_type_id は新規形式ID
    const newSubQuestion = {
      id: crypto.randomUUID(), // sub_question_id
      sub_question_id: crypto.randomUUID(), // explicit sub_question_id
      question_id: question.id || question.question_id, // 親の大問ID
      sub_question_number: (question.sub_questions?.length || 0) + 1,
      sub_question_type_id: 10, // Default to 10 (記述式) - NEW SCHEMA
      question_content: '',
      question_format: 0,
      answer_explanation: '',
      answer_format: 0,
      keywords: [],
      // Legacy aliases
      subQuestionNumber: (question.sub_questions?.length || 0) + 1,
      questionTypeId: 10,
      questionContent: '',
      questionFormat: 0,
      answerContent: '',
      answerFormat: 0,
    };
    newQuestions[qIndex] = {
      ...question,
      sub_questions: [...(question.sub_questions || []), newSubQuestion],
      subQuestions: [...(question.sub_questions || []), newSubQuestion],
    };
    onChange({ ...safeExam, questions: newQuestions });
  };

  const handleSubQuestionChange = (qIndex: number, sqIndex: number, updates: any) => {
    const newQuestions = [...safeExam.questions];
    const question = newQuestions[qIndex];
    // sub_questions が undefined の場合は空配列として扱う（クラッシュ防止）
    const subQuestions = question.sub_questions || question.subQuestions || [];
    const newSubQuestions = [...subQuestions];
    newSubQuestions[sqIndex] = { ...newSubQuestions[sqIndex], ...updates };
    newQuestions[qIndex] = { ...question, sub_questions: newSubQuestions, subQuestions: newSubQuestions };
    onChange({ ...safeExam, questions: newQuestions });
  };

  const handleDeleteSubQuestion = (qIndex: number, sqIndex: number) => {
    const newQuestions = [...safeExam.questions];
    const question = newQuestions[qIndex];
    // sub_questions が undefined の場合は空配列として扱う
    const subQuestions = question.sub_questions || question.subQuestions || [];
    const newSubQuestions = subQuestions.filter((_: any, i: number) => i !== sqIndex);
    // 削除後、小問番号を再採番
    const renumberedSubQuestions = newSubQuestions.map((sq: any, idx: number) => ({
      ...sq,
      sub_question_number: idx + 1,
      subQuestionNumber: idx + 1,
    }));
    newQuestions[qIndex] = { ...question, sub_questions: renumberedSubQuestions, subQuestions: renumberedSubQuestions };
    onChange({ ...safeExam, questions: newQuestions });
  };

  return (
    <Stack spacing={4} sx={{ pb: 10 }}>
      {safeExam.questions?.map((question: any, qIndex: number) => (
        <QuestionBlock
          key={question.id || qIndex}
          questionNumber={question.questionNumber || question.question_number}
          content={question.questionContent || question.question_content}
          format={question.questionFormat || question.question_format}
          difficulty={question.difficulty}
          keywords={question.keywords}
          canEdit={true}
          canSwitchFormat={true}
          onContentChange={(content) => handleQuestionChange(qIndex, { questionContent: content, question_content: content })}
          onFormatChange={(format) => handleQuestionChange(qIndex, { questionFormat: format, question_format: format })}
          onDifficultyChange={(diff) => handleQuestionChange(qIndex, { difficulty: diff })}
          onKeywordAdd={(keyword) => {
            // 大門キーワード追加
            const newKeyword = { id: `kw-${Date.now()}`, keyword };
            handleQuestionChange(qIndex, {
              keywords: [...(question.keywords || []), newKeyword],
            });
          }}
          onKeywordRemove={(keywordId) => {
            // 大門キーワード削除
            const filtered = question.keywords?.filter((kw: any) => kw.id !== keywordId) || [];
            handleQuestionChange(qIndex, { keywords: filtered });
          }}
          onDelete={() => handleDeleteQuestion(qIndex)}
        >
          <Stack spacing={2}>
            {question.subQuestions?.length > 0 ? (
              question.subQuestions.map((subQ: any, sqIndex: number) => (
                <SubQuestionBlock
                  key={subQ.id || sqIndex}
                  id={subQ.id || `sq-${qIndex}-${sqIndex}`}
                  subQuestionNumber={subQ.subQuestionNumber || subQ.sub_question_number}
                  questionTypeId={subQ.questionTypeId || subQ.question_type_id}
                  questionContent={subQ.questionContent || subQ.question_content || ''}
                  answerContent={subQ.answerContent || subQ.answer_content || ''}
                  explanation={subQ.explanation || subQ.answer_explanation || ''}
                  keywords={subQ.keywords}
                  options={subQ.options}
                  pairs={subQ.pairs}
                  items={subQ.items}
                  answers={subQ.answers}
                  canEdit={true}
                  showAnswer={true}
                  onQuestionChange={(content) => handleSubQuestionChange(qIndex, sqIndex, { questionContent: content, question_content: content })}
                  onAnswerChange={(content) => handleSubQuestionChange(qIndex, sqIndex, { answerContent: content, answer_content: content })}
                  onTypeChange={(typeId) => handleSubQuestionChange(qIndex, sqIndex, { questionTypeId: typeId, question_type_id: typeId })}
                  onKeywordAdd={(keyword) => {
                    const newKeyword = { id: `kw-${Date.now()}`, keyword };
                    handleSubQuestionChange(qIndex, sqIndex, {
                      keywords: [...(subQ.keywords || []), newKeyword],
                    });
                  }}
                  onKeywordRemove={(keywordId) => {
                    const filtered = subQ.keywords?.filter((kw: any) => kw.id !== keywordId) || [];
                    handleSubQuestionChange(qIndex, sqIndex, { keywords: filtered });
                  }}
                  onDelete={() => handleDeleteSubQuestion(qIndex, sqIndex)}
                />
              ))
            ) : (
              question.sub_questions?.map((subQ: any, sqIndex: number) => (
                <SubQuestionBlock
                  key={subQ.id || sqIndex}
                  id={subQ.id || `sq-${qIndex}-${sqIndex}`}
                  subQuestionNumber={subQ.sub_question_number}
                  questionTypeId={subQ.question_type_id}
                  questionContent={subQ.question_content}
                  answerContent={subQ.answer_content}
                  keywords={subQ.keywords}
                  options={subQ.options}
                  pairs={subQ.pairs}
                  items={subQ.items}
                  answers={subQ.answers}
                  canEdit={true}
                  explanation={subQ.explanation || subQ.answer_explanation}
                  showAnswer={true}
                  onQuestionChange={(content) => handleSubQuestionChange(qIndex, sqIndex, { question_content: content })}
                  onAnswerChange={(content) => handleSubQuestionChange(qIndex, sqIndex, { answer_content: content })}
                  onTypeChange={(typeId) => handleSubQuestionChange(qIndex, sqIndex, { question_type_id: typeId })}
                  onKeywordAdd={(keyword) => {
                    const newKeyword = { id: `kw-${Date.now()}`, keyword };
                    handleSubQuestionChange(qIndex, sqIndex, {
                      keywords: [...(subQ.keywords || []), newKeyword],
                    });
                  }}
                  onKeywordRemove={(keywordId) => {
                    const filtered = subQ.keywords?.filter((kw: any) => kw.id !== keywordId) || [];
                    handleSubQuestionChange(qIndex, sqIndex, { keywords: filtered });
                  }}
                  onDelete={() => handleDeleteSubQuestion(qIndex, sqIndex)}
                />
              ))
            )}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddSubQuestion(qIndex)}
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            >
              小問を追加
            </Button>
          </Stack>
        </QuestionBlock>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
          size="large"
        >
          大問を追加
        </Button>
      </Box>
    </Stack>
  );
}
