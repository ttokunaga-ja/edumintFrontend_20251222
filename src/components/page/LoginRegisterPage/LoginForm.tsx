// @ts-nocheck
import React from 'react';
import { Label } from '@/components/primitives/label';
import { Input } from '@/components/primitives/input';
import { Button } from '@/components/primitives/button';
import { useLoginForm } from '@/pages/LoginRegisterPage/hooks';

interface LoginFormProps {
  onSubmit: ReturnType<typeof useLoginForm>['submit'];
  email: string;
  password: string;
  isSubmitting: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  email,
  password,
  isSubmitting,
  setEmail,
  setPassword,
}) => {
  return (
    <div >
      <div >
        <Label htmlFor="login-email">メールアドレス</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div >
        <Label htmlFor="login-password">パスワード</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button  onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'ログイン中…' : 'ログイン'}
      </Button>
    </div>
  );
};
