import type { User } from '@/types';

export const useSocialAuth = (onAuth: (user: User, isNewUser: boolean) => void) => {
  const makeUser = (provider: string): User => {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      username: `${provider}_user`,
      displayName: `${provider} User`,
      email: `${provider}@example.com`,
      isEmailVerified: true,
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
  };

  const signInWithGoogle = () => onAuth(makeUser('google'), false);
  const signInWithMicrosoft = () => onAuth(makeUser('microsoft'), false);
  const signInWithUniversity = () => onAuth(makeUser('university'), false);

  return { signInWithGoogle, signInWithMicrosoft, signInWithUniversity };
};
