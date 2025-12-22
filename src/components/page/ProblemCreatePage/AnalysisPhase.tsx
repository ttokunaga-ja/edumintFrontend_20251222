import React from 'react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ProblemEditor } from '@/components/page/ProblemViewEditPage/ProblemEditor';
import { ProblemMetaBlock } from '@/components/page/ProblemViewEditPage/ProblemMetaBlock';

type AnalysisPhaseProps = {
  exam: any;
  onChange: (exam: any) => void;
  onBack: () => void;
  onNext: () => void;
};

export function AnalysisPhase({ exam, onChange, onBack, onNext }: AnalysisPhaseProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">構造の確認と編集</h2>
          <p className="text-gray-600 font-medium">AIが抽出した問題の構成情報を編集してください。</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="rounded-xl px-6">
            戻る
          </Button>
          <Button onClick={onNext} className="rounded-xl px-8 bg-indigo-600">
            問題を生成する
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-8 rounded-2xl shadow-xl bg-white border-none min-h-[500px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">構造ツリー</h3>
            <div className="border border-indigo-100 rounded-2xl p-6 bg-indigo-50/20">
              <p className="text-indigo-600 font-bold mb-4">大問・小問の構造</p>
              <ProblemEditor exam={exam} onChange={onChange} />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ProblemMetaBlock
            exam={exam}
            isOwner
            onLike={() => {}}
            onDislike={() => {}}
            onBookmark={() => {}}
            onShare={() => {}}
            onReport={() => {}}
            onExportPDF={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
