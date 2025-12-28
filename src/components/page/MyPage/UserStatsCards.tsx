// @ts-nocheck
import { FileText, Eye, Heart, MessageCircle, TrendingUp, Award } from 'lucide-react';

export type UserStats = {
  totalProblems: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgLikesPerProblem: number;
  rank?: string;
};

export type UserStatsCardsProps = {
  stats: UserStats;
  isLoading?: boolean;
  className?: string;
};

export function UserStatsCards({ stats, isLoading = false, className = '' }: UserStatsCardsProps) {
  const cards = [
    {
      icon: FileText,
      label: '投稿数',
      value: stats.totalProblems,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: Eye,
      label: '総閲覧数',
      value: stats.totalViews.toLocaleString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Heart,
      label: '総いいね数',
      value: stats.totalLikes.toLocaleString(),
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      icon: MessageCircle,
      label: '総コメント数',
      value: stats.totalComments.toLocaleString(),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: '平均いいね/問題',
      value: stats.avgLikesPerProblem.toFixed(1),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (stats.rank) {
    cards.push({
      icon: Award,
      label: 'ランク',
      value: stats.rank,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    });
  }

  if (isLoading) {
    return (
      <div >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} >
            <div ></div>
            <div ></div>
            <div ></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            
          >
            <div >
              <Icon  />
            </div>
            <div >{card.label}</div>
            <div >{card.value}</div>
          </div>
        );
      })}
    </div>
  );
}
