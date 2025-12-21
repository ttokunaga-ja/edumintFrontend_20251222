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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div>
          <h1 className="text-xl font-semibold text-gray-900">プロフィール設定</h1>
          <p className="text-sm text-gray-600">
            本実装は暫定版です。最低限の情報を入力して完了してください。
          </p>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-700">ユーザー名</span>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="edumint_user"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-700">大学</span>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="EduMint大学"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm text-gray-700">学部</span>
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="情報学部"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          設定を完了する
        </button>
      </form>
    </div>
  );
}

export default ProfileSetupPage;
