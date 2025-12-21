import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description,
  action,
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center space-y-3 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {children}
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
