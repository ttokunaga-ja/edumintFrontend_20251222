// @ts-nocheck
import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';

export type ProblemSettings = {
  autoGenerateQuestions: boolean; // 自動問題生成
  questionCount?: number; // 生成する問題数
  includeAnswers: boolean; // 解答を含める
  includeSolutions: boolean; // 解説を含める
  difficultyLevel: number; // 1: 基礎, 2: 応用, 3: 発展
  questionTypes: number[]; // 問題形式ID配列
  extractKeywords: boolean; // キーワード自動抽出
  isPublic: boolean; // 公開設定
};

export type ProblemSettingsBlockProps = {
  settings: ProblemSettings;
  onChange: (settings: ProblemSettings) => void;
  className?: string;
};

const difficultyOptions = [
  { value: 1, label: '基礎', description: '基本的な問題を生成' },
  { value: 2, label: '応用', description: '標準的な問題を生成' },
  { value: 3, label: '発展', description: '難易度の高い問題を生成' },
];

const questionTypeOptions = [
  { id: 1, name: '記述式' },
  { id: 2, name: '選択式' },
  { id: 3, name: '穴埋め' },
  { id: 4, name: '論述式' },
  { id: 5, name: '証明問題' },
  { id: 6, name: '数値計算式' },
];

export function ProblemSettingsBlock({ settings, onChange, className = '' }: ProblemSettingsBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = (key: keyof ProblemSettings) => {
    onChange({
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    });
  };

  const handleNumberChange = (key: keyof ProblemSettings, value: number) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleQuestionTypeToggle = (typeId: number) => {
    const currentTypes = settings.questionTypes || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(id => id !== typeId)
      : [...currentTypes, typeId];
    
    onChange({
      ...settings,
      questionTypes: newTypes,
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-indigo-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">問題設定</h3>
            <p className="text-xs text-gray-600 mt-0.5">生成オプションと公開設定</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* コンテンツ */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* AI生成設定 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <span>AI生成設定</span>
              <Info className="w-4 h-4 text-gray-400" title="AIによる問題自動生成の設定" />
            </h4>

            {/* 自動生成オン/オフ */}
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">自動問題生成</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  アップロードした資料からAIが問題を自動生成
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoGenerateQuestions}
                onChange={() => handleToggle('autoGenerateQuestions')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            {/* 問題数（自動生成がオンの場合のみ） */}
            {settings.autoGenerateQuestions && (
              <div className="ml-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  生成する問題数
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.questionCount || 5}
                  onChange={(e) => handleNumberChange('questionCount', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500">1〜20問の範囲で指定できます</p>
              </div>
            )}

            {/* 難易度レベル（自動生成がオンの場合のみ） */}
            {settings.autoGenerateQuestions && (
              <div className="ml-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  難易度レベル
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {difficultyOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.difficultyLevel === option.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={option.value}
                        checked={settings.difficultyLevel === option.value}
                        onChange={() => handleNumberChange('difficultyLevel', option.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm text-gray-900">{option.label}</span>
                      <span className="text-xs text-gray-600 mt-1">{option.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 問題形式（自動生成がオンの場合のみ） */}
            {settings.autoGenerateQuestions && (
              <div className="ml-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  問題形式（複数選択可）
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {questionTypeOptions.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                        settings.questionTypes?.includes(type.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.questionTypes?.includes(type.id) || false}
                        onChange={() => handleQuestionTypeToggle(type.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* コンテンツ設定 */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900">コンテンツ設定</h4>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">解答を含める</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  問題に対する解答を生成・表示
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.includeAnswers}
                onChange={() => handleToggle('includeAnswers')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">解説を含める</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  解答の詳しい解説を生成・表示
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.includeSolutions}
                onChange={() => handleToggle('includeSolutions')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                disabled={!settings.includeAnswers}
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">キーワード自動抽出</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  問題から重要キーワードを自動抽出
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.extractKeywords}
                onChange={() => handleToggle('extractKeywords')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* 公開設定 */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900">公開設定</h4>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">公開する</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  他のユーザーがこの問題を閲覧・検索できるようにする
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.isPublic}
                onChange={() => handleToggle('isPublic')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            {!settings.isPublic && (
              <div className="ml-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 非公開の場合、あなただけが閲覧できます。後から公開設定を変更することもできます。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
