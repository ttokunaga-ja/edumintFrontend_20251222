import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      {actions && <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>{actions}</div>}
    </div>
  );
};

export default PageHeader;
