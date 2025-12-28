// @ts-nocheck
import { useState } from 'react';
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  FileText,
  Flag,
  Calendar,
  School,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Badge } from '@/components/primitives/badge';
import { Card, CardContent } from '@/components/primitives/card';
import { formatNumber, formatDate, getDifficultyLabel, getDifficultyColor } from '@/shared/utils';
import type { Exam } from '@/types';

export interface ProblemMetaBlockProps {
  exam: Exam;
  isOwner: boolean;
  onLike: () => void;
  onDislike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onReport: () => void;
  onExportPDF: () => void;
  isBookmarked?: boolean;
  className?: string;
  disableCommunityActions?: boolean; // Disable like/dislike/bookmark/share
  disableShareAction?: boolean; // Disable only share
}

export default function ProblemMetaBlock({
  exam,
  isOwner,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onReport,
  onExportPDF,
  isBookmarked = false,
  className = '',
  disableCommunityActions = false,
  disableShareAction = false,
}: ProblemMetaBlockProps) {
  const [isSticky, setIsSticky] = useState(false);

  const metaItems = [
    {
      icon: School,
      label: '大学',
      value: exam.universityName || exam.school,
    },
    {
      icon: BookOpen,
      label: '学部',
      value: exam.facultyName || '-',
    },
    {
      icon: BookOpen,
      label: '科目',
      value: exam.subjectName,
    },
    {
      icon: UserIcon,
      label: '教授',
      value: exam.teacherName || '-',
    },
    {
      icon: Calendar,
      label: '年度',
      value: `${exam.examYear}年`,
    },
  ];

  const stats = [
    {
      icon: Eye,
      label: '閲覧数',
      value: formatNumber(exam.viewCount),
      color: 'text-blue-600',
    },
    {
      icon: ThumbsUp,
      label: 'いいね',
      value: formatNumber(exam.goodCount),
      color: 'text-green-600',
    },
    {
      icon: ThumbsDown,
      label: 'バッド',
      value: formatNumber(exam.badCount),
      color: 'text-red-600',
    },
    {
      icon: MessageCircle,
      label: 'コメント',
      value: formatNumber(exam.commentCount),
      color: 'text-purple-600',
    },
  ];

  return (
    <Card className={`${className} ${isSticky ? 'md:sticky md:top-20' : ''}`}>
      <CardContent className="p-6 space-y-6">
        {/* タイトルとバッジ */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">{exam.examName}</h1>
          <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
            <Badge className={getDifficultyColor(0)}>
              {getDifficultyLabel(0)}
            </Badge>
            <Badge variant="outline">
              {exam.majorType === 0 ? '理系' : '文系'}
            </Badge>
            {exam.isPublic ? (
              <Badge variant="default">公開</Badge>
            ) : (
              <Badge variant="secondary">非公開</Badge>
            )}
            {isOwner && <Badge variant="secondary">自分の投稿</Badge>}
          </div>
        </div>

        {/* メタ情報 */}
        <div style={{
      gap: "0.75rem"
    }>
          {metaItems.map((item, index) => (
            <div key={index} style={{
      display: "flex"
    }>
              <item.icon className="size-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
          <div style={{
      display: "flex"
    }>
            <UserIcon className="size-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500">投稿者</div>
              <div className="text-sm font-medium text-gray-900 truncate">
                {exam.userName}
              </div>
            </div>
          </div>
          <div style={{
      display: "flex"
    }>
            <Calendar className="size-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500">投稿日</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(exam.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className={`size-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {/* インタラクションボタン */}
          <div style={{
      gap: "0.5rem"
    }>
            <Button
              variant={exam.userLiked ? 'default' : 'outline'}
              size="sm"
              onClick={onLike}
              disabled={disableCommunityActions}
              style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            >
              <ThumbsUp className="size-4" />
              <span>{exam.userLiked ? 'いいね済み' : 'いいね'}</span>
            </Button>
            <Button
              variant={exam.userDisliked ? 'destructive' : 'outline'}
              size="sm"
              onClick={onDislike}
              disabled={disableCommunityActions}
              style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            >
              <ThumbsDown className="size-4" />
              <span>{exam.userDisliked ? 'バッド済み' : 'バッド'}</span>
            </Button>
          </div>

          {/* ユーティリティボタン */}
          <div style={{
      gap: "0.5rem"
    }>
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={onBookmark}
              disabled={disableCommunityActions}
              style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            >
              <Bookmark className="size-4" />
              <span>{isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              disabled={disableCommunityActions || disableShareAction}
              style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            >
              <Share2 className="size-4" />
              <span>共有</span>
            </Button>
          </div>

          {/* エクスポート・通報ボタン */}
          <div style={{
      gap: "0.5rem"
    }>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            >
              <FileText className="size-4" />
              <span>PDF出力</span>
            </Button>
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReport}
                style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
              >
                <Flag className="size-4" />
                <span>報告</span>
              </Button>
            )}
          </div>
        </div>

        {/* 更新日時 */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          最終更新: {formatDate(exam.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );
}

export { ProblemMetaBlock };
