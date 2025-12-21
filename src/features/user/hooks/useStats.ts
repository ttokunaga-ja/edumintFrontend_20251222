import { useEffect, useState } from 'react';
import { getUserStats, type UserStats } from '@/services/api/gateway/user';

const emptyStats: UserStats = {
  totalProblems: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  avgLikesPerProblem: 0,
  rank: '',
};

export const useStats = (userId?: string) => {
  const [stats, setStats] = useState<UserStats>(emptyStats);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const result = await getUserStats(userId);
        if (isMounted) {
          setStats(result || emptyStats);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
        if (isMounted) setStats(emptyStats);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    };

    if (userId) {
      loadStats();
    } else {
      setIsLoadingStats(false);
      setStats(emptyStats);
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { stats, isLoadingStats };
};
