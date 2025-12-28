import React from 'react';
import { Card } from '@/components/primitives/card';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
      <Card className="w-full max-w-3xl p-8 shadow-lg border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
        </div>
        {children}
      </Card>
    </div>
  );
};
