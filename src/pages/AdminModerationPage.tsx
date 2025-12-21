// @ts-nocheck
export interface AdminModerationPageProps {
  onNavigate?: (path: string) => void;
}

export function AdminModerationPage({
  onNavigate,
}: AdminModerationPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
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
