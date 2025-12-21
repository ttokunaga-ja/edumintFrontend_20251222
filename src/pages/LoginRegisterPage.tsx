import React from 'react';
import {
  AuthLayout,
  AuthProviderButtons,
  AcademicDomainHint,
  LoginForm,
  RegisterForm,
} from '@/components/page/LoginRegisterPage';
import { useLoginForm, useRegisterForm, useSocialAuth } from './LoginRegisterPage/hooks';
import type { User } from '@/types';

export interface LoginRegisterPageProps {
  onLogin: (user: User, isNewUser: boolean) => void;
}

export function LoginRegisterPage({ onLogin }: LoginRegisterPageProps) {
  const login = useLoginForm(onLogin);
  const register = useRegisterForm(onLogin);
  const social = useSocialAuth(onLogin);

  return (
    <AuthLayout title="EduMint ログイン/登録" description="大学アカウントで安全にログイン">
      <div className="space-y-6">
        <AuthProviderButtons
          onAuth={social.signInWithGoogle}
          onMicrosoft={social.signInWithMicrosoft}
          onUniversity={social.signInWithUniversity}
        />

        <AcademicDomainHint />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">ログイン</h2>
            <LoginForm
              onSubmit={login.submit}
              email={login.email}
              password={login.password}
              isSubmitting={login.isSubmitting}
              setEmail={login.setEmail}
              setPassword={login.setPassword}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">新規登録</h2>
            <RegisterForm
              onSubmit={register.submit}
              email={register.email}
              username={register.username}
              password={register.password}
              isSubmitting={register.isSubmitting}
              setEmail={register.setEmail}
              setUsername={register.setUsername}
              setPassword={register.setPassword}
            />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginRegisterPage;
