// @ts-nocheck
// ========================================
// EduMint - HomePage Component
// Legacy → New Migration Complete
// 📍 Alert Insertion Points: A, B
// Grid: 16/24/32px spacing
// Layout: max-w-7xl, responsive grid
// ========================================

import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  ThumbsUp,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import AdvancedSearchPanel from "@/components/page/HomePage/AdvancedSearchPanel";
import { ContextHealthAlert } from "@/components/common/ContextHealthAlert";
import { Card } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { cn } from "@/shared/utils";
import type { Exam } from "@/types/health";
import type { Page } from "@/types";
import { useServiceHealthContext } from "@/contexts/ServiceHealthContext";
import { searchExams, type SearchFilters } from "@/features/search/repository";

export interface HomePageProps {
  /** Initial search query */
  initialQuery?: string;
  /** Current user profile (for default university/faculty) */
  currentUser?: {
    id?: string;
    username?: string;
    email?: string;
    universityName?: string;
    facultyName?: string;
    university?: string;
    department?: string;
  } | null;
  /** Navigation handler (optional for legacy compatibility) */
  onNavigate?: (page: Page, problemId?: string) => void;
  /** Logout handler (optional for legacy compatibility) */
  onLogout?: () => void;
}

/**
 * HomePage Component
 *
 * Main landing page with:
 * - AdvancedSearchPanel with all 10 filters (dropdown-based)
 * - Sort toggles bar (おすすめ/最新/人気/閲覧数) with item count
 * - Problem cards grid (responsive: 1→2→3 columns)
 * - Pagination
 *
 * Layout (New Design):
 * - TopMenuBar (in full app)
 * - AdvancedSearchPanel (initially collapsed)
 * - Sort bar with count display
 * - Problem list grid
 * - Pagination
 *
 * Layout Details:
 * - Desktop: max-w-7xl, px-8, 3-column grid
 * - Mobile: px-4, 1-column stack
 *
 * @example
 * <HomePage
 *   initialQuery="微分積分"
 *   currentUser={{ universityName: "東京大学", facultyName: "工学部" }}
 * />
 */
export function HomePage({
  initialQuery = "",
  currentUser,
  onNavigate,
  onLogout,
}: HomePageProps) {
  // ========================================
  // Service Health Monitoring
  // ========================================
  const { health, refresh: refreshHealth } =
    useServiceHealthContext();

  // ========================================
  // State Management
  // ========================================

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "recommended",
    page: 1,
    limit: 20,
  });
  const [problems, setProblems] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10234);

  // ========================================
  // Data Fetching
  // ========================================

  useEffect(() => {
    fetchProblems();
  }, [filters, currentPage, query]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const fetchProblems = async () => {
    setIsLoading(true);

    try {
      const response = await searchExams({
        ...filters,
        keyword: query,
        page: currentPage,
      });

      setProblems(response.exams as any);
      setTotalItems(response.total);
      setTotalPages(
        Math.ceil(response.total / (filters.limit || 20)),
      );
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // Event Handlers
  // ========================================

  const handleRetryContent = () => {
    console.log("Retrying content load");
    fetchProblems();
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleProblemClick = (problemId: string) => {
    if (onNavigate) {
      onNavigate("problem-view", problemId);
    } else {
      console.log("Navigate to problem:", problemId);
    }
  };

  // ========================================
  // Render
  // ========================================

  // Normalize university and faculty names
  const universityName = currentUser?.universityName || currentUser?.university;
  const facultyName = currentUser?.facultyName || currentUser?.department;

  return (
    <div className="min-h-screen bg-white">
      {/* TopMenuBar would be here in full app */}

      {/* 📍 Alert Insertion Point A: Search Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {(health.search === "degraded" ||
          health.search === "outage" ||
          health.search === "maintenance") && (
            <ContextHealthAlert
              id="alert-a-search"
              category="検索機能"
              status={health.search}
              message={
                health.search === "degraded"
                  ? "現在、検索機能に遅延が発生しています。しばらく時間をおいてから再度お試しください。"
                  : health.search === "outage"
                    ? "検索機能が一時的にご利用いただけません。システム復旧後に再度お試しください。"
                    : "検索機能がメンテナンス中です。まもなく復旧します。"
              }
              className="mb-4"
            />
          )}
      </div>

      {/* AdvancedSearchPanel */}
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdvancedSearchPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            defaultUniversity={universityName}
            defaultFaculty={facultyName}
            searchStatus={health.search}
            initialExpanded={false}
          />
        </div>
      </div>

      {/* Sort Toggles & Count */}
      <div className="py-4 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600">
                並び替え:
              </span>
              {(
                [
                  "recommended",
                  "newest",
                  "likes",
                  "views",
                ] as const
              ).map((sortOption) => (
                <button
                  key={sortOption}
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      sortBy: sortOption,
                    })
                  }
                  disabled={health.search !== "operational"}
                  className={cn(
                    "h-9 px-4 rounded-full border text-sm transition-colors",
                    filters.sortBy === sortOption
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100",
                    health.search !== "operational" &&
                    "opacity-50 cursor-not-allowed",
                  )}
                >
                  {sortOption === "recommended" && "おすすめ"}
                  {sortOption === "newest" && "最新"}
                  {sortOption === "likes" && "人気"}
                  {sortOption === "views" && "閲覧数"}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {totalItems.toLocaleString()} 件の演習問題から探す
            </div>
          </div>
        </div>
      </div>

      {/* ContentSection */}
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 📍 Alert Insertion Point B: Content Status */}
          {(health.content === "outage" ||
            health.content === "maintenance") && (
              <ContextHealthAlert
                category="コンテンツサービス"
                status={health.content}
                message={
                  health.content === "outage"
                    ? "コンテンツの読み込みに失敗しました。しばらく時間をおいてから再度お試しください。"
                    : "コンテンツサービスがメンテナンス中です。まもなく復旧します。"
                }
                action={
                  health.content === "outage"
                    ? {
                      label: "再試行",
                      onClick: handleRetryContent,
                    }
                    : undefined
                }
                className="mb-6"
              />
            )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">
                読み込み中...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && problems.length === 0 && (
            <div className="text-center py-12 max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">
                検索結果が見つかりませんでした
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                別のキーワードで検索してみてください
              </p>
            </div>
          )}

          {/* Problem Cards Grid */}
          {!isLoading && problems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <Card
                  key={problem.id}
                  className={cn(
                    "p-6 h-48",
                    "hover:shadow-md transition-shadow cursor-pointer",
                  )}
                  onClick={() => handleProblemClick(problem.id)}
                >
                  {/* Title */}
                  <h3 className="text-gray-900 mb-2 line-clamp-2">
                    {problem.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {problem.subject}
                    </Badge>
                    <Badge variant="secondary">
                      {problem.universityName}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(problem.viewCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {(problem.likeCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {(problem.commentCount || 0).toLocaleString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && problems.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className={cn(
                    "h-9 px-4 rounded-lg border",
                    "hover:bg-gray-50 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  ←
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                  className={cn(
                    "h-9 px-4 rounded-lg border",
                    "hover:bg-gray-50 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
