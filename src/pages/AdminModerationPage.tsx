// @ts-nocheck
export interface AdminModerationPageProps {
  onNavigate?: (path: string) => void;
}

export function AdminModerationPage({
  onNavigate,
}: AdminModerationPageProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
<<<<<<< HEAD
    }}
      <div className={undefined}>
        <h1 className={undefined}>
=======
    }>
      <div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
          Admin Moderation
        </h1>
        <p className="text-gray-600">
          Coming Soon. This page will handle content moderation and
          admin workflows.
        </p>
        {onNavigate && (
          <button
            className="text-indigo-600 hover:underline"
            onClick={() => onNavigate("home")}
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminModerationPage;
