import React from 'react';
import { Sparkles } from 'lucide-react';
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
import type { Difficulty, ExerciseOptionsState } from '@/pages/ProblemCreatePage/hooks/useProblemCreateFlow';

type ExerciseOptionsProps = {
  options: ExerciseOptionsState;
  onChange: (options: ExerciseOptionsState) => void;
};

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'auto', label: '自動判別' },
  { value: 'basic', label: '基礎' },
  { value: 'standard', label: '標準' },
  { value: 'applied', label: '応用' },
  { value: 'difficult', label: '難関' },
];

export function ExerciseOptions({ options, onChange }: ExerciseOptionsProps) {
  const handleDifficultyChange = (value: Difficulty) => {
    onChange({ ...options, difficulty: value });
  };

  const handleCommonToggle = (key: keyof ExerciseOptionsState) => {
    onChange({ ...options, [key]: !options[key] });
  };

  return (
    <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">演習問題から生成</h3>
            <p className="text-sm text-gray-500">
              既存の問題をベースに類題を生成します。公開や構造確認などの挙動をここで指定してください。
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:border-indigo-200 transition-colors cursor-pointer">
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

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:border-indigo-200 transition-colors cursor-pointer">
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

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:border-indigo-200 transition-colors cursor-pointer">
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
