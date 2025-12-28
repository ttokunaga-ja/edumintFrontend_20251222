// @ts-nocheck
import { Settings, Sparkles, FileText, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';

export interface GenerationSettings {
  autoGenerateQuestions: boolean;
  questionCount?: number;
  includeAnswers: boolean;
  includeSolutions: boolean;
  difficultyLevel: number;
  questionTypes: number[];
  extractKeywords: boolean;
  isPublic: boolean;
  useAdvancedAI: boolean;
  preserveFormatting: boolean;
  detectDiagrams: boolean;
  splitBySection: boolean;
  generatePracticeTests: boolean;
  optimizeForMobile: boolean;
}

export interface GenerationSettingsSummaryProps {
  settings: GenerationSettings;
  onEdit?: () => void;
  showEditButton?: boolean;
  className?: string;
}

const difficultyLabels = ['超基礎', '基礎', '標準', '応用', '発展', '最難関'];
const questionTypeLabels: Record<number, string> = {
  1: '記述式',
  2: '選択式',
  3: '論述式',
  4: '穴埋め式',
  5: '正誤判定',
  6: '数値計算',
  7: '証明問題',
  8: 'プログラミング',
};

export function GenerationSettingsSummary({
  settings,
  onEdit,
  showEditButton = true,
  className = '',
}: GenerationSettingsSummaryProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <div style={{
      display: "flex",
      alignItems: "center",
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
          <Settings className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm text-gray-900">生成設定</h3>
        </div>
        {showEditButton && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs">
            編集
          </Button>
        )}
      </div>

      {/* 設定内容 */}
      <div className="p-4 space-y-4">
        {/* AI生成設定 */}
        <div>
          <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs text-gray-700">AI生成</h4>
          </div>
          <div className="space-y-2">
            <div style={{
      display: "flex",
      alignItems: "center"
    }>
              <span className="text-gray-600">自動問題生成</span>
              <Badge variant={settings.autoGenerateQuestions ? 'default' : 'secondary'} className="text-xs">
                {settings.autoGenerateQuestions ? 'ON' : 'OFF'}
              </Badge>
            </div>
            {settings.autoGenerateQuestions && (
              <>
                <div style={{
      display: "flex",
      alignItems: "center"
    }>
                  <span className="text-gray-600">生成数</span>
                  <span className="text-gray-900">{settings.questionCount || 5}問</span>
                </div>
                <div style={{
      display: "flex",
      alignItems: "center"
    }>
                  <span className="text-gray-600">難易度</span>
                  <Badge variant="outline" className="text-xs">
                    {difficultyLabels[settings.difficultyLevel] || '標準'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 問題形式 */}
        {settings.questionTypes.length > 0 && (
          <div>
            <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs text-gray-700">問題形式</h4>
            </div>
            <div style={{
      display: "flex",
      gap: "0.25rem"
    }>
              {settings.questionTypes.map(typeId => (
                <Badge key={typeId} variant="secondary" className="text-xs">
                  {questionTypeLabels[typeId] || `Type ${typeId}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* コンテンツ設定 */}
        <div>
          <h4 className="text-xs text-gray-700 mb-2">コンテンツ</h4>
          <div className="space-y-1.5">
            {settings.includeAnswers && (
              <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>解答を含む</span>
              </div>
            )}
            {settings.includeSolutions && (
              <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>解説を含む</span>
              </div>
            )}
            {settings.extractKeywords && (
              <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>キーワード自動抽出</span>
              </div>
            )}
          </div>
        </div>

        {/* 高度な設定 */}
        {(settings.useAdvancedAI || settings.preserveFormatting || settings.detectDiagrams) && (
          <div>
            <h4 className="text-xs text-gray-700 mb-2">高度な設定</h4>
            <div className="space-y-1.5">
              {settings.useAdvancedAI && (
                <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>高度なAIモデル使用</span>
                </div>
              )}
              {settings.preserveFormatting && (
                <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>書式保持</span>
                </div>
              )}
              {settings.detectDiagrams && (
                <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>図表検出</span>
                </div>
              )}
              {settings.splitBySection && (
                <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>セクション分割</span>
                </div>
              )}
              {settings.optimizeForMobile && (
                <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>モバイル最適化</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 公開設定 */}
        <div className="pt-3 border-t border-gray-200">
          <div style={{
      display: "flex",
      alignItems: "center"
    }>
            <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
              {settings.isPublic ? (
                <Unlock className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-700">公開設定</span>
            </div>
            <Badge variant={settings.isPublic ? 'default' : 'secondary'} className="text-xs">
              {settings.isPublic ? '公開' : '非公開'}
            </Badge>
          </div>
        </div>
      </div>

      {/* 処理時間見積もり（オプション） */}
      {settings.autoGenerateQuestions && (
        <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
          <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
            <div className="flex-shrink-0">
              <div className="w-1 h-1 mt-1.5 bg-blue-500 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-900">
                推定処理時間:
                <span className="font-medium ml-1">
                  {settings.useAdvancedAI ? '3-5分' : '1-3分'}
                </span>
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                バックグラウンドで処理されます
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
