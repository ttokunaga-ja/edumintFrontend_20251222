import React from 'react';
import { Button } from '@/components/primitives/button';
import { useSocialAuth } from '@/pages/LoginRegisterPage/hooks';

interface AuthProviderButtonsProps {
  onAuth: ReturnType<typeof useSocialAuth>['signInWithGoogle'];
  onMicrosoft: ReturnType<typeof useSocialAuth>['signInWithMicrosoft'];
  onUniversity: ReturnType<typeof useSocialAuth>['signInWithUniversity'];
}

export const AuthProviderButtons: React.FC<AuthProviderButtonsProps> = ({
  onAuth,
  onMicrosoft,
  onUniversity,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button variant="outline" onClick={onAuth}>
        Google で続行
      </Button>
      <Button variant="outline" onClick={onMicrosoft}>
        Microsoft で続行
      </Button>
      <Button variant="outline" onClick={onUniversity}>
        大学アカウントで続行
      </Button>
    </div>
  );
};
