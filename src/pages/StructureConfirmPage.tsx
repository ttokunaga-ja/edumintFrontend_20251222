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
    <div >
      <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"

    }}
        <header className={undefined}>
          <p className={undefined}>構造確認モード: {mode}</p>
          <h1 className={undefined}>StructureConfirmPage</h1>
          <p className={undefined}>

    }>
        <header >
          <p >構造確認モード: {mode}</p>
          <h1 >StructureConfirmPage</h1>
          <p >

            問題設定・構造確認の本実装が未連携のため、暫定のコンポーネントを表示しています。
          </p>
        </header>

        <div >
          <p>ユーザー: {user.username}</p>
          <p>大学: {user.universityName || user.university || '未設定'}</p>
          <p>学部: {user.facultyName || user.department || '未設定'}</p>
        </div>

        <div style={{
      display: "flex",
      gap: "0.75rem"

    }}

    }>

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


          >

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


          >

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


          >

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


          >

            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

export default StructureConfirmPage;
