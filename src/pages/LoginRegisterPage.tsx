import React, { useState } from 'react';
import {
  AuthLayout,
  AuthProviderButtons,
  AcademicDomainHint,
  LoginForm,
  RegisterForm,
} from '@/components/page/LoginRegisterPage';
import { cn } from '@/shared/utils';
import { useLoginForm, useRegisterForm, useSocialAuth } from './LoginRegisterPage/hooks';
import type { User } from '@/types';

export interface LoginRegisterPageProps {
  onLogin: (user: User, isNewUser: boolean) => void;
}

export function LoginRegisterPage({ onLogin }: LoginRegisterPageProps) {
  const login = useLoginForm(onLogin);
  const register = useRegisterForm(onLogin);
  const social = useSocialAuth(onLogin);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <AuthLayout title="EduMint ログイン/登録" description="大学アカウントで安全にログイン">
      <div className="space-y-6">
        <AuthProviderButtons
          onAuth={social.signInWithGoogle}
          onMicrosoft={social.signInWithMicrosoft}
          onUniversity={social.signInWithUniversity}
        />

        <AcademicDomainHint />

        <div style={{
      display: "flex"
<<<<<<< HEAD
    }}
=======
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'login' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            ログイン
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'register' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            新規登録
          </button>
        </div>

        {activeTab === 'login' ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <LoginForm
              onSubmit={login.submit}
              email={login.email}
              password={login.password}
              isSubmitting={login.isSubmitting}
              setEmail={login.setEmail}
              setPassword={login.setPassword}
            />
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        )}
      </div>
    </AuthLayout>
  );
}

export default LoginRegisterPage;
