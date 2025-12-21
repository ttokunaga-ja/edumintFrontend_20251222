import React from 'react';
import TopMenuBar from '@/components/common/TopMenuBar';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { UserStatsCards } from '@/components/page/MyPage/UserStatsCards';
import { WalletCard } from '@/components/page/MyPage/WalletCard';
import { ProfileEditForm } from '@/components/page/MyPage/ProfileEditForm';
import type { Page, User } from '@/types';
import { useMyPageController } from './MyPage/hooks/useMyPageController';

export interface MyPageProps {
  user: User;
  onNavigate: (page: Page, problemId?: string) => void;
  onNavigateToEdit?: (
    page: Page,
    problemId: string,
    mode: 'create' | 'edit',
  ) => void;
  onLogout: () => void;
}

export function MyPage({
  user,
  onNavigate,
  onNavigateToEdit,
  onLogout,
}: MyPageProps) {
  const {
    profile,
    stats,
    wallet,
    isLoadingStats,
    isLoadingWallet,
    isSavingProfile,
    profileVersion,
    handleProfileSave,
    handleProfileCancel,
    handleCreateProblem,
    handleEditProblem,
    handleGoHome,
    handleLogout,
  } = useMyPageController({ user, onNavigate, onNavigateToEdit, onLogout });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenuBar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">MyPage</h1>
            <p className="text-gray-600">プロフィールとウォレットを管理します。</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>

        <UserStatsCards stats={stats} isLoading={isLoadingStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <WalletCard
            balance={
              wallet
                ? {
                  balance: wallet.balance,
                  pendingEarnings: wallet.pendingEarnings,
                  totalEarnings: wallet.totalEarnings,
                  currency: wallet.currency,
                  lastUpdated: wallet.lastUpdated,
                }
                : undefined
            }
            isLoading={isLoadingWallet}
            disableWithdrawal
            className="lg:col-span-1"
          />
          <ProfileEditForm
            key={profileVersion}
            user={profile}
            onSave={handleProfileSave}
            onCancel={handleProfileCancel}
            className="lg:col-span-2"
          />
        </div>

        <Card className="p-4 flex flex-wrap gap-3">
          <Button onClick={handleCreateProblem} className="bg-indigo-600 text-white hover:bg-indigo-700">
            新しい問題を作成
          </Button>
          <Button variant="outline" onClick={handleEditProblem}>
            既存の問題を編集
          </Button>
          <Button variant="ghost" onClick={handleGoHome}>
            ホームへ
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default MyPage;
