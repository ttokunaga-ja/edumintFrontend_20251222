import React from 'react';
import { AlertCircle } from 'lucide-react'; export const AcademicDomainHint: React.FC = () => ( <div style={{ display: undefined, gap: "0.5rem" }> <AlertCircle /> <p>.ac.jp などの大学メールや大学SSOでのログインを推奨します。学外ドメインの場合は機能が制限されることがあります。</p> </div>
);
