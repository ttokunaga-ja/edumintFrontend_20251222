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
    <Card >
      <div  />
      <div >
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <div>
            <h3 >演習問題から生成</h3>
            <p >
              既存の問題をベースに類題を生成します。公開や構造確認などの挙動をここで指定してください。
            </p>
          </div>
          <Sparkles  />
        </div>

        <div >
          <Label >難易度</Label>
          <Select value={options.difficulty} onValueChange={(val) => handleDifficultyChange(val as Difficulty)}>
            <SelectTrigger >
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
              
            />
            <div>
              <div >図表を使用</div>
              <p >図や表を解析対象に含めます</p>
            </div>
          </label>

          <label style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <Checkbox
              checked={options.confirmStructure}
              onCheckedChange={() => handleCommonToggle('confirmStructure')}
              
            />
            <div>
              <div >問題構造を確認</div>
              <p >OFFの場合は構造確認フェーズをスキップします</p>
            </div>
          </label>

          <label style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <Checkbox
              checked={options.isPublic}
              onCheckedChange={() => handleCommonToggle('isPublic')}
              
            />
            <div>
              <div >生成問題を公開</div>
              <p >完了後に自動で公開します</p>
            </div>
          </label>
        </div>
      </div>
    </Card>
  );
}
