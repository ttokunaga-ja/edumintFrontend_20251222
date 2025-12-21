import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getUserProfile, updateUserProfile } from '@/services/api/gateway/user';

export const useProfile = (initialUser: User) => {
  const [profile, setProfile] = useState<User>(initialUser);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const latest = await getUserProfile();
        if (isMounted) {
          setProfile(latest);
          setProfileVersion((v) => v + 1);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = async (updates: Partial<User>) => {
    setIsSavingProfile(true);
    try {
      const updated = await updateUserProfile(updates);
      setProfile(updated);
      setProfileVersion((v) => v + 1);
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const resetProfile = () => {
    setProfile((current) => ({ ...current }));
    setProfileVersion((v) => v + 1);
  };

  return { profile, isSavingProfile, profileVersion, saveProfile, resetProfile };
};
