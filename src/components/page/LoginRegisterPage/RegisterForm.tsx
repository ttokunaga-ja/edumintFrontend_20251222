// @ts-nocheck
import React from 'react';
import { Label } from '@/components/primitives/label';
import { Input } from '@/components/primitives/input';
import { Button } from '@/components/primitives/button';
import { useRegisterForm } from '@/pages/LoginRegisterPage/hooks';

interface RegisterFormProps {
  onSubmit: ReturnType<typeof useRegisterForm>['submit'];
  email: string;
  username: string;
  password: string;
  isSubmitting: boolean;
  setEmail: (value: string) => void;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  email,
  username,
  password,
  isSubmitting,
  setEmail,
  setUsername,
  setPassword,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">メールアドレス</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-username">ユーザー名</Label>
        <Input
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">パスワード</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button className="w-full" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? '登録中…' : 'アカウントを作成'}
      </Button>
    </div>
  );
};
