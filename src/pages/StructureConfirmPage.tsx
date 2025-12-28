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
      <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
<<<<<<< HEAD
    }}
        <header className={undefined}>
          <p className={undefined}>構造確認モード: {mode}</p>
          <h1 className={undefined}>StructureConfirmPage</h1>
          <p className={undefined}>
=======
    }>
        <header className="space-y-1">
          <p className="text-sm text-gray-500">構造確認モード: {mode}</p>
          <h1 className="text-2xl font-semibold text-gray-900">StructureConfirmPage</h1>
          <p className="text-gray-600">
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            問題設定・構造確認の本実装が未連携のため、暫定のコンポーネントを表示しています。
          </p>
        </header>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p>ユーザー: {user.username}</p>
          <p>大学: {user.universityName || user.university || '未設定'}</p>
          <p>学部: {user.facultyName || user.department || '未設定'}</p>
        </div>

        <div style={{
      display: "flex",
      gap: "0.75rem"
<<<<<<< HEAD
    }}
=======
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
          <button
            type="button"
            onClick={proceedToGenerating}
            style={{
      borderRadius: "0.375rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
<<<<<<< HEAD
=======
          >
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            生成へ進む
          </button>
          <button
            type="button"
            onClick={goProblemView}
            style={{
      borderRadius: "0.375rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
<<<<<<< HEAD
=======
          >
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            問題閲覧へ戻る
          </button>
          <button
            type="button"
            onClick={goHome}
            style={{
      borderRadius: "0.375rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
<<<<<<< HEAD
=======
          >
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            ホームへ戻る
          </button>
          <button
            type="button"
            onClick={logout}
            style={{
      borderRadius: "0.375rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
<<<<<<< HEAD
=======
          >
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

export default StructureConfirmPage;
