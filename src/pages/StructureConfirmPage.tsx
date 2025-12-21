import React from 'react';
import { useStructureConfirm } from './StructureConfirmPage/hooks/useStructureConfirm';
import type { Page, User } from '@/types';

export interface StructureConfirmPageProps {
  user: User;
  onNavigate: (page: Page, problemId?: string) => void;
  onLogout: () => void;
  mode: 'create' | 'edit';
}

export function StructureConfirmPage({ user, onNavigate, onLogout, mode }: StructureConfirmPageProps) {
  const { proceedToGenerating, goProblemView, goHome, logout } = useStructureConfirm({
    onNavigate,
    onLogout,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-gray-500">構造確認モード: {mode}</p>
          <h1 className="text-2xl font-semibold text-gray-900">StructureConfirmPage</h1>
          <p className="text-gray-600">
            問題設定・構造確認の本実装が未連携のため、暫定のコンポーネントを表示しています。
          </p>
        </header>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p>ユーザー: {user.username}</p>
          <p>大学: {user.universityName || user.university || '未設定'}</p>
          <p>学部: {user.facultyName || user.department || '未設定'}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={proceedToGenerating}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            生成へ進む
          </button>
          <button
            type="button"
            onClick={goProblemView}
            className="rounded-md border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            問題閲覧へ戻る
          </button>
          <button
            type="button"
            onClick={goHome}
            className="rounded-md border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            ホームへ戻る
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

export default StructureConfirmPage;
