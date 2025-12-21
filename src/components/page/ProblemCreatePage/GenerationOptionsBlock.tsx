// @ts-nocheck
import { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export type GenerationOptions = {
  useAdvancedAI: boolean; // 高度なAIモデルを使用
  preserveFormatting: boolean; // 元の書式を保持
  detectDiagrams: boolean; // 図表を検出
  splitBySection: boolean; // セクションごとに分割
  generatePracticeTests: boolean; // 練習問題を生成
  optimizeForMobile: boolean; // モバイル表示を最適化
};

export type GenerationOptionsBlockProps = {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
  isProcessing?: boolean;
  className?: string;
};

export function GenerationOptionsBlock({
  options,
  onChange,
  isProcessing = false,
  className = '',
}: GenerationOptionsBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = (key: keyof GenerationOptions) => {
    if (isProcessing) return;

    onChange({
      ...options,
      [key]: !options[key as keyof typeof options],
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors border-b border-gray-100"
        disabled={isProcessing}
      >
        <div className="flex items-center gap-3">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">生成オプション</h3>
            <p className="text-xs text-gray-600 mt-0.5">AI処理の詳細設定</p>
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
        <div className="p-4 sm:p-6 space-y-4">
          {/* 処理中の警告 */}
          {isProcessing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                処理中はオプションを変更できません
              </div>
            </div>
          )}

          {/* 高度なAIモデル */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                高度なAIモデルを使用
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">推奨</span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                より正確な問題生成が可能（処理時間が増加する場合があります）
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.useAdvancedAI}
              onChange={() => handleToggle('useAdvancedAI')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* 書式保持 */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">元の書式を保持</div>
              <div className="text-xs text-gray-600 mt-0.5">
                PDF/資料の元の書式やレイアウトを可能な限り保持
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.preserveFormatting}
              onChange={() => handleToggle('preserveFormatting')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* 図表検出 */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">図表を検出</div>
              <div className="text-xs text-gray-600 mt-0.5">
                資料内の図表やグラフを認識して問題に含める
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.detectDiagrams}
              onChange={() => handleToggle('detectDiagrams')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* セクション分割 */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">セクションごとに分割</div>
              <div className="text-xs text-gray-600 mt-0.5">
                章やセクションごとに問題を分けて生成
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.splitBySection}
              onChange={() => handleToggle('splitBySection')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* 練習問題生成 */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">練習問題を生成</div>
              <div className="text-xs text-gray-600 mt-0.5">
                本試験問題に加えて、追加の練習問題も生成
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.generatePracticeTests}
              onChange={() => handleToggle('generatePracticeTests')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* モバイル最適化 */}
          <label
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">モバイル表示を最適化</div>
              <div className="text-xs text-gray-600 mt-0.5">
                スマートフォンでの閲覧に最適化された形式で生成
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.optimizeForMobile}
              onChange={() => handleToggle('optimizeForMobile')}
              disabled={isProcessing}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </label>

          {/* 処理時間の見積もり */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">処理時間の目安</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>基本設定: 約1-2分</li>
                  <li>高度なAI + 図表検出: 約3-5分</li>
                  <li>すべてのオプション有効: 約5-10分</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
