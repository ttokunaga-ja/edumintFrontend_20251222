import { useState } from 'react';
import type { User } from '@/types';

export const useLoginForm = (onLogin: (user: User, isNewUser: boolean) => void) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const user: User = {
      id: crypto.randomUUID(),
      username: email || 'guest_user',
      displayName: email || 'Guest User',
      email: email || 'guest@example.com',
      isEmailVerified: false,
      universityName: 'EduMint University',
      university: 'EduMint University',
      facultyName: 'General Studies',
      department: 'General Studies',
      academicField: 'interdisciplinary',
      majorType: 'science',
      role: 'user',
      status: 'active',
      mintcoinBalance: 0,
      followerCount: 0,
      blockedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    onLogin(user, false);
    setIsSubmitting(false);
  };

  return {
    email,
    password,
    isSubmitting,
    setEmail,
    setPassword,
    submit,
  };
};
