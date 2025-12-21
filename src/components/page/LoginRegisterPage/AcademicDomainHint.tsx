import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AcademicDomainHint: React.FC = () => (
  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
    <AlertCircle className="w-4 h-4 mt-0.5" />
    <p>.ac.jp などの大学メールや大学SSOでのログインを推奨します。学外ドメインの場合は機能が制限されることがあります。</p>
  </div>
);
