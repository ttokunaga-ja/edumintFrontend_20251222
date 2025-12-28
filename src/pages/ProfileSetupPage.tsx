import React from 'react';
import { useProfileSetupForm } from './ProfileSetupPage/hooks/useProfileSetupForm';
import type { User } from '@/types';

export interface ProfileSetupPageProps {
  onComplete: (user: User) => void;
  initialEmail?: string;
}

export function ProfileSetupPage({ onComplete, initialEmail }: ProfileSetupPageProps) {
  const {
    username,
    university,
    department,
    isSubmitting,
    setUsername,
    setUniversity,
    setDepartment,
    submit,
  } = useProfileSetupForm({ onComplete, initialEmail });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }}
      <form
        onSubmit={submit}
        className={undefined}
      >
        <div>
          <h1 className={undefined}>プロフィール設定</h1>
          <p className={undefined}>
            本実装は暫定版です。最低限の情報を入力して完了してください。
          </p>
        </div>

        <label className={undefined}>
          <span className={undefined}>ユーザー名</span>
          <input
            style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="edumint_user"
          />
        </label>

        <label className={undefined}>
          <span className={undefined}>大学</span>
          <input
            style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="EduMint大学"
          />
        </label>

        <label className={undefined}>
          <span className={undefined}>学部</span>
          <input
            style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="情報学部"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
      borderRadius: "0.375rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
          設定を完了する
        </button>
      </form>
    </div>
  );
}

export default ProfileSetupPage;
