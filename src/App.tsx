import { useState, useEffect } from "react";
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
import "@/styles/globals.css";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
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
    setCurrentPage("login");
  };

  const handleNavigate = (page: Page, problemId?: string) => {
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
        <TopMenuBar
          currentUser={user!}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onSearch={(query: string) => {
            setSearchQuery(query);
            if (currentPage !== "home") {
              handleNavigate("home");
            }
          }}
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
