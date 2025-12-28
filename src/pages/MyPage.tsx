import React, { useState } from 'react';
import { Button } from '@/components/primitives/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/primitives/avatar';
import { ProfileEditForm } from '@/components/page/MyPage/ProfileEditForm';
import { ProblemCard } from '@/components/common/ProblemCard';
import { UserStatsCards } from '@/components/page/MyPage/UserStatsCards';
import { WalletCard } from '@/components/page/MyPage/WalletCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/primitives/accordion";
import { mockExams } from '@/mocks/mockData/search';
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
  } = useMyPageController({ user, onNavigate, onNavigateToEdit, onLogout });

  // Mock data for display
  const [viewedProblems] = useState(mockExams.slice(0, 4));
  const [ratedProblems] = useState(mockExams.slice(2, 6));
  const [commentedProblems] = useState(mockExams.slice(4, 7));
  const [postedProblems] = useState(mockExams.slice(1, 4));

  const ProblemSection = ({ title, problems, viewAllFilter }: { title: string, problems: any[], viewAllFilter: string }) => (
    <div style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
<<<<<<< HEAD
    }}
      <div style={{
      display: "flex",
      alignItems: "center"
    }}
        <h3 className={undefined}>{title}</h3>
=======
    }>
      <div style={{
      display: "flex",
      alignItems: "center"
    }>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-medium"
          onClick={() => onNavigate('home', viewAllFilter)}
        >
          View all
        </Button>
      </div>
      {problems.length > 0 ? (
        <div style={{
      display: "flex",
      paddingLeft: "1rem",
      paddingRight: "1rem"
<<<<<<< HEAD
    }}
=======
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
          {problems.map(p => (
            <div key={p.id} className="min-w-[280px] w-[280px] flex-shrink-0 snap-start">
              <ProblemCard
                problem={p}
                onClick={(id) => onNavigate('problem-view', id)}
                className="h-full border-0 shadow-lg hover:translate-y-[-2px] transition-transform"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 px-1">履歴はありません。</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
<<<<<<< HEAD
    }}
=======
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))

        {/* Profile Header (YouTube Style) */}
        <div style={{
      display: "flex",
      alignItems: "center"
<<<<<<< HEAD
    }}
          <Avatar className={undefined}>
=======
    }>
          <Avatar className="w-20 h-20 border-2 border-white shadow-sm">
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-indigo-600 text-white text-2xl">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.displayName || profile.username}</h1>
            <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
<<<<<<< HEAD
    }}
=======
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
              <span>@{profile.username}</span>
            </div>
          </div>
        </div>

        {/* History / Lists */}
        <div className="space-y-8">
          <ProblemSection title="履歴" problems={viewedProblems} viewAllFilter="history" />
          <ProblemSection title="高評価した問題" problems={ratedProblems} viewAllFilter="likes" />
          <ProblemSection title="コメントした問題" problems={commentedProblems} viewAllFilter="comments" />
          <ProblemSection title="投稿した問題" problems={postedProblems} viewAllFilter="posts" />
        </div>

        {/* Settings Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <span className="text-lg font-semibold text-gray-900">アカウント設定 & ステータス</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-8 transition-all duration-300">
                {/* Stats & Wallet inside accordion */}
                <section>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">ステータス</h4>
                  <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      ステータス機能は現在開発中です (Coming Soon)
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">ウォレット</h4>
                  <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      ウォレット機能は現在開発中です (Coming Soon)
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">プロフィール編集</h4>
                  <ProfileEditForm
                    key={profileVersion}
                    user={profile}
                    onSave={handleProfileSave}
                    onCancel={handleProfileCancel}
                  />
                </section>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}

export default MyPage;
