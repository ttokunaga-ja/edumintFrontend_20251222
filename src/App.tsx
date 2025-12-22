import { useState, useEffect, useCallback } from "react";
import { User, Page } from "@/types";
import {
  HomePage,
  ProblemViewEditPage,
  LoginRegisterPage,
  ProblemCreatePage,
  MyPage,
  ProfileSetupPage,
  StructureConfirmPage,
} from "@/pages";
import { ServiceHealthProvider } from "@/contexts/ServiceHealthContext";
import TopMenuBar from "@/components/common/TopMenuBar";
import Sidebar from "@/components/common/Sidebar";
import NotificationPopover from "@/components/common/NotificationPopover";
import "@/styles/globals.css";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  console.log("HMR smoke test: App render");
  const [selectedProblemId, setSelectedProblemId] = useState<
    string | null
  >(null);
  const [needsProfileSetup, setNeedsProfileSetup] =
    useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [viewedAnswerAds, setViewedAnswerAds] = useState<
    Set<string>
  >(new Set()); // 解答広告を見た試験ID
  const [viewedQuestionAds, setViewedQuestionAds] = useState<
    Set<string>
  >(new Set()); // 問題文広告を見た試験ID
  const [editMode, setEditMode] = useState<"create" | "edit">(
    "create",
  ); // 編集モード
  const [shouldStartInEditMode, setShouldStartInEditMode] =
    useState(false); // ProblemViewEditPageで編集モードで開始
  const [searchQuery, setSearchQuery] = useState(""); // 検索クエリ

  // ========================================
  // Job Handoff State Management
  // ========================================
  const [currentJobId, setCurrentJobId] = useState<string | undefined>(
    undefined,
  ); // 生成ジョブID
  const [lastGeneratedProblemId, setLastGeneratedProblemId] = useState<string | undefined>(
    undefined,
  ); // 最後に生成された問題ID

  // ========================================
  // Job Handoff: Generated problem callback
  // ========================================
  const handleGenerated = (problemId: string) => {
    setLastGeneratedProblemId(problemId);
    setSelectedProblemId(problemId);
    setCurrentPage("problem-view");
  };

  // Cookie/セッションチェック（自動ログイン）
  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    // モック: Cookieやトークンから自動ログインチェック
    const savedUser = localStorage.getItem("edumint_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentPage("home");
      } catch (e) {
        console.error("Auto login failed", e);
      }
    }
  };

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsNotificationsOpen(false);
    setIsSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen && !isNotificationsOpen) return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside Sidebar
      if (isSidebarOpen) {
        const sidebar = document.getElementById("sidebar-overlay");
        const menuBtn = target.closest('[data-trigger="menu-button"]');
        if (sidebar && !sidebar.contains(target) && !menuBtn) {
          closeSidebar();
        }
      }

      // Check if click is outside Notifications
      if (isNotificationsOpen) {
        const popover = document.getElementById("notifications-popover");
        const bellBtn = target.closest('[data-trigger="notification-bell"]');
        if (popover && !popover.contains(target) && !bellBtn) {
          setIsNotificationsOpen(false);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, isNotificationsOpen, closeSidebar]);

  const handleLogin = (userData: User, isNewUser: boolean) => {
    if (isNewUser) {
      // 新規登録の場合、プロフィール設定が必要
      setNeedsProfileSetup(true);
      setTempEmail(userData.email);
    } else {
      // 既存ユーザーの場合、そのままログイン
      setUser(userData);
      localStorage.setItem(
        "edumint_user",
        JSON.stringify(userData),
      );
      setCurrentPage("home");
    }
  };

  const handleProfileComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem(
      "edumint_user",
      JSON.stringify(userData),
    );
    setNeedsProfileSetup(false);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("edumint_user");
    closeSidebar();
    setCurrentPage("login");
  };

  const handleNavigate = (page: Page, problemId?: string) => {
    closeSidebar();
    if (page === "login") {
      handleLogout();
      return;
    }
    setCurrentPage(page);
    if (problemId) {
      // generatingページの場合、problemIdはjobIdとして扱う
      if (page === "generating") {
        setCurrentJobId(problemId);
      } else {
        setSelectedProblemId(problemId);
      }
    }
    // structure-confirmページ以外では編集モードをリセット
    if (page !== "structure-confirm") {
      setEditMode("create");
    }
    // 通常の遷移では編集モードで開始しない
    setShouldStartInEditMode(false);
  };

  const handleNavigateToEdit = (
    page: Page,
    problemId: string,
    mode: "create" | "edit",
  ) => {
    closeSidebar();
    setCurrentPage(page);
    setSelectedProblemId(problemId);
    setEditMode(mode);
    // マイページからの編集では、ProblemViewEditPageを編集モードで開始
    if (page === "problem-view") {
      setShouldStartInEditMode(true);
    }
  };

  const handleAnswerAdViewed = (examId: string) => {
    console.log("🎬 解答広告視聴完了:", {
      examId,
      before: Array.from(viewedAnswerAds),
    });
    setViewedAnswerAds(new Set([...viewedAnswerAds, examId]));
  };

  const handleQuestionAdViewed = (examId: string) => {
    console.log("🎬 問題文広告視聴完了:", {
      examId,
      before: Array.from(viewedQuestionAds),
    });
    setViewedQuestionAds(
      new Set([...viewedQuestionAds, examId]),
    );
  };

  // 未ログインユーザーの検索ページ閲覧を許可
  if (!user && currentPage === "home") {
    return (
      <ServiceHealthProvider>
        <HomePage
          currentUser={null}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          initialQuery={searchQuery}
        />
      </ServiceHealthProvider>
    );
  }

  // 未ログインユーザーが問題構造ページにアクセスした場合（problem-viewに統合）
  if (
    !user &&
    currentPage === "problem-structure" &&
    selectedProblemId
  ) {
    return (
      <ServiceHealthProvider>
        <ProblemViewEditPage
          user={null}
          problemId={selectedProblemId}
          hasViewedAnswerAd={false}
          onAnswerAdViewed={() => { }}
          hasViewedQuestionAd={false}
          onQuestionAdViewed={() => { }}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          initialViewMode="structure"
        />
      </ServiceHealthProvider>
    );
  }

  if (
    !user &&
    currentPage !== "home" &&
    currentPage !== "problem-structure"
  ) {
    if (needsProfileSetup) {
      return (
        <ProfileSetupPage
          onComplete={handleProfileComplete}
          initialEmail={tempEmail}
        />
      );
    }
    return <LoginRegisterPage onLogin={handleLogin} />;
  }

  // ログインユーザーがアクセスできるページ
  if (!user) {
    return <LoginRegisterPage onLogin={handleLogin} />;
  }

  return (
    <ServiceHealthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* TopMenuBar: ログイン済みユーザーのみ表示 */}
        {/* TopMenuBar: ログイン済みユーザーのみ表示 */}
        <TopMenuBar
          currentUser={user!}
          currentPage={currentPage}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onMenuClick={() => {
            const willOpen = !isSidebarOpen;
            setIsSidebarOpen(willOpen);
            if (willOpen) setIsNotificationsOpen(false);
          }}
          onNotificationClick={() => {
            const willOpen = !isNotificationsOpen;
            setIsNotificationsOpen(willOpen);
            // If we are opening notifications, force sidebar close.
            // Even if closing, sidebar shouldn't be open, but safe to set false.
            closeSidebar();
          }}
          onQueryChange={(query: string) => {
            setSearchQuery(query);
          }}
          onSearchSubmit={() => {
            handleNavigate("home");
          }}
        />

        <div className="relative z-[145]">
          <NotificationPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        {currentPage === "home" && (
          <HomePage
            currentUser={{
              id: user!.id,
              username: user!.username,
              email: user!.email,
              university: user!.university || user!.universityName,
              department: user!.department || user!.facultyName,
            }}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            initialQuery={searchQuery}
          />
        )}
        {currentPage === "problem-structure" &&
          selectedProblemId && (
            <ProblemViewEditPage
              user={user!}
              problemId={selectedProblemId}
              hasViewedAnswerAd={viewedAnswerAds.has(
                selectedProblemId,
              )}
              onAnswerAdViewed={() =>
                handleAnswerAdViewed(selectedProblemId)
              }
              hasViewedQuestionAd={viewedQuestionAds.has(
                selectedProblemId,
              )}
              onQuestionAdViewed={() =>
                handleQuestionAdViewed(selectedProblemId)
              }
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              initialViewMode="structure"
            />
          )}
        {currentPage === "problem-view" && selectedProblemId && (
          <ProblemViewEditPage
            user={user!}
            problemId={selectedProblemId}
            hasViewedAnswerAd={viewedAnswerAds.has(
              selectedProblemId,
            )}
            onAnswerAdViewed={() =>
              handleAnswerAdViewed(selectedProblemId)
            }
            hasViewedQuestionAd={viewedQuestionAds.has(
              selectedProblemId,
            )}
            onQuestionAdViewed={() =>
              handleQuestionAdViewed(selectedProblemId)
            }
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            shouldStartInEditMode={shouldStartInEditMode}
          />
        )}
        {currentPage === "problem-create" && (
          <ProblemCreatePage
            user={user!}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
        {currentPage === "structure-confirm" && (
          <StructureConfirmPage
            user={user!}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            mode={editMode}
          />
        )}
        {currentPage === "generating" && (
          <ProblemCreatePage
            user={user!}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            jobId={currentJobId}
            onGenerated={handleGenerated}
          />
        )}
        {currentPage === "my-page" && (
          <MyPage
            user={user!}
            onNavigate={handleNavigate}
            onNavigateToEdit={handleNavigateToEdit}
            onLogout={handleLogout}
          />
        )}
      </div>
    </ServiceHealthProvider>
  );
}

export default App;
