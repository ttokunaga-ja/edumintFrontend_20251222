import React, { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/primitives/card';
import { Label } from '@/components/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { Checkbox } from '@/components/primitives/checkbox';
import { Slider } from '@/components/primitives/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/primitives/accordion';
import type { Difficulty, DocumentOptionsState } from '@/pages/ProblemCreatePage/hooks/useProblemCreateFlow';
import { cn } from '@/shared/utils';

type DocumentOptionsProps = {
  options: DocumentOptionsState;
  onChange: (options: DocumentOptionsState) => void;
};

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'auto', label: '自動判別' },
  { value: 'basic', label: '基礎' },
  { value: 'standard', label: '標準' },
  { value: 'applied', label: '応用' },
  { value: 'difficult', label: '難関' },
];

const formatOptions: { id: string; label: string }[] = [
  { id: 'descriptive', label: '記述式' },
  { id: 'multiple-choice', label: '選択式' },
  { id: 'fill-blank', label: '穴埋め式' },
  { id: 'true-false', label: '正誤判定' },
  { id: 'numeric', label: '数値計算式' },
  { id: 'proof', label: '証明問題' },
  { id: 'programming', label: 'プログラミング' },
  { id: 'code-reading', label: 'コード読解' },
];

export function DocumentOptions({ options, onChange }: DocumentOptionsProps) {
  const questionCountValue = useMemo(() => [options.questionCount], [options.questionCount]);

  const update = (next: Partial<DocumentOptionsState>) => {
    onChange({ ...options, ...next });
  };

  const handleCommonToggle = (key: keyof DocumentOptionsState) => {
    update({ [key]: !options[key] } as Partial<DocumentOptionsState>);
  };

  const handleDifficultyChange = (value: Difficulty) => {
    update({ difficulty: value });
  };

  const handleQuestionCountChange = (value: number[]) => {
    const nextVal = Math.min(20, Math.max(5, value[0] ?? 10));
    update({ questionCount: nextVal });
  };

  const handleFormatAutoToggle = (checked: boolean) => {
    update({
      formatConfig: {
        ...options.formatConfig,
        isAuto: checked,
        selectedFormats: checked ? [] : options.formatConfig.selectedFormats,
      },
    });
  };

  const handleFormatSelect = (formatId: string) => {
    if (options.formatConfig.isAuto) return;
    const current = options.formatConfig.selectedFormats;
    const exists = current.includes(formatId);
    const next = exists ? current.filter((f) => f !== formatId) : [...current, formatId];
    update({
      formatConfig: {
        ...options.formatConfig,
        selectedFormats: next,
      },
    });
  };

  return (
    <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      <div className="space-y-8">
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <div>
            <h3 className="text-xl font-bold text-gray-900">資料から生成</h3>
            <p className="text-sm text-gray-500">
              講義資料を解析し、問題の難易度・数・形式を細かく指定できます。
            </p>
          </div>
          <FileText className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm text-gray-700">難易度</Label>
            <Select value={options.difficulty} onValueChange={(val) => handleDifficultyChange(val as Difficulty)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="難易度を選択" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-gray-700">問題数 (5〜20)</Label>
            <div className="space-y-4">
              <input
                type="number"
                min={5}
                max={20}
                style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                value={options.questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleQuestionCountChange([val]);
<<<<<<< HEAD
                }} />
=======
                }}
              />
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
              <div style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }>
                <Slider
                  min={5}
                  max={20}
                  step={1}
                  value={questionCountValue}
                  onValueChange={handleQuestionCountChange}
                  className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div style={{
      display: "flex",
      alignItems: "center"
    }>
            <Label className="text-sm text-gray-700">問題形式</Label>
            <label style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
              <Checkbox
                checked={options.formatConfig.isAuto}
                onCheckedChange={(checked) => handleFormatAutoToggle(Boolean(checked))}
              />
              自動設定
            </label>
          </div>

          <Accordion type="single" collapsible disabled={options.formatConfig.isAuto} defaultValue="formats">
            <AccordionItem value="formats" style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className={cn('text-sm font-semibold', options.formatConfig.isAuto && 'text-gray-400')}>
                  個別指定（複数選択可）
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <div style={{
      gap: "0.5rem"
    }>
                  {formatOptions.map((format) => {
                    const isChecked = options.formatConfig.selectedFormats.includes(format.id);
                    return (
                      <label
                        key={format.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors',
                          isChecked ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300',
                          options.formatConfig.isAuto && 'opacity-50 cursor-not-allowed',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={options.formatConfig.isAuto}
                          onChange={() => handleFormatSelect(format.id)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <span className="text-sm text-gray-900">{format.label}</span>
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div style={{
      gap: "0.75rem"
    }>
          <label style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <Checkbox
              checked={options.useDiagrams}
              onCheckedChange={() => handleCommonToggle('useDiagrams')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-sm text-gray-900">図表を使用</div>
              <p className="text-xs text-gray-600">図や表を解析対象に含めます</p>
            </div>
          </label>

          <label style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <Checkbox
              checked={options.confirmStructure}
              onCheckedChange={() => handleCommonToggle('confirmStructure')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-sm text-gray-900">問題構造を確認</div>
              <p className="text-xs text-gray-600">OFFの場合は構造確認フェーズをスキップします</p>
            </div>
          </label>

          <label style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <Checkbox
              checked={options.isPublic}
              onCheckedChange={() => handleCommonToggle('isPublic')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-sm text-gray-900">生成問題を公開</div>
              <p className="text-xs text-gray-600">完了後に自動で公開します</p>
            </div>
          </label>
        </div>
      </div>
    </Card>
  );
}
