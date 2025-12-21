import type { Page } from '@/types';

type Params = {
  onNavigate: (page: Page, problemId?: string) => void;
  onLogout: () => void;
};

export const useStructureConfirm = ({ onNavigate, onLogout }: Params) => {
  const proceedToGenerating = () => {
    const nextId = crypto.randomUUID();
    onNavigate('generating', nextId);
  };

  const goProblemView = () => onNavigate('problem-view');
  const goHome = () => onNavigate('home');

  return {
    proceedToGenerating,
    goProblemView,
    goHome,
    logout: onLogout,
  };
};
