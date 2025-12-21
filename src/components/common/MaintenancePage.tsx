import React from 'react';

export interface MaintenancePageProps {
  title?: string;
  message?: string;
  className?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  title = 'メンテナンス中です',
  message = '現在システムメンテナンスを実施しています。しばらく時間をおいてから再度お試しください。',
  className = '',
}) => {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <span className="text-xl">🛠️</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default MaintenancePage;
