import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AcademicDomainHint: React.FC = () => (
  <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
    <AlertCircle className="w-4 h-4 mt-0.5" />
    <p>.ac.jp などの大学メールや大学SSOでのログインを推奨します。学外ドメインの場合は機能が制限されることがあります。</p>
  </div>
);
