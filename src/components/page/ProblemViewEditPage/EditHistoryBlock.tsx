// @ts-nocheck
import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/card';
import { Badge } from '@/components/primitives/badge';
import { formatDate } from '@/shared/utils';

export interface EditHistory {
  id: string;
  version: number;
  changedBy: string;
  changedAt: string;
  changes: Record<string, any>;
  description?: string;
}

export interface EditHistoryBlockProps {
  history: EditHistory[];
  currentVersion: number;
  onRollback?: (version: number) => void;
  className?: string;
}

export default function EditHistoryBlock({
  history,
  currentVersion,
  onRollback,
  className = '',
}: EditHistoryBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedHistory = showAll ? history : history.slice(0, 5);

  const getChangeDescription = (changes: Record<string, any>): string => {
    const changeKeys = Object.keys(changes);
    if (changeKeys.length === 0) return '変更なし';
    if (changeKeys.length === 1) return `${changeKeys[0]}を変更`;
    return `${changeKeys.length}箇所を変更`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="size-5 text-gray-500" />
            <CardTitle className="text-lg">編集履歴</CardTitle>
            <Badge variant="outline">v{currentVersion}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <span>{isExpanded ? '閉じる' : '表示'}</span>
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {displayedHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              編集履歴はありません
            </div>
          ) : (
            <>
              {displayedHistory.map((item) => (
                <div
                  key={item.id}
                  className={`border border-gray-200 rounded-lg p-4 ${item.version === currentVersion ? 'bg-indigo-50 border-indigo-300' : 'bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={item.version === currentVersion ? 'default' : 'secondary'}>
                        v{item.version}
                      </Badge>
                      {item.version === currentVersion && (
                        <Badge variant="default">現在のバージョン</Badge>
                      )}
                    </div>
                    {onRollback && item.version !== currentVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRollback(item.version)}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="size-3" />
                        <span>復元</span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.description || getChangeDescription(item.changes)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>編集者: {item.changedBy}</span>
                      <span>•</span>
                      <span>{formatDate(item.changedAt)}</span>
                    </div>
                  </div>

                  {/* 変更の詳細 */}
                  {Object.keys(item.changes).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(item.changes).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex items-start space-x-2">
                            <span className="font-medium min-w-[80px]">{key}:</span>
                            <span className="flex-1 truncate">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(item.changes).length > 3 && (
                          <div className="text-gray-400 italic">
                            他 {Object.keys(item.changes).length - 3} 件の変更...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* もっと見るボタン */}
              {history.length > 5 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? '一部を表示' : `すべて表示 (${history.length}件)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export { EditHistoryBlock };
