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
      
    >
      <h3 >{title}</h3>
      {description && <p >{description}</p>}
      {children}
      {action && <div style={{
      display: "flex",
      justifyContent: "center"
    }>{action}</div>}
    </div>
  );
};

export default EmptyState;
