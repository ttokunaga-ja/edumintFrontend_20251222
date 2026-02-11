import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ProfileEditForm, ProfileEditFormData } from './ProfileEditForm';
import { ComingSoon } from '@/components/common/ComingSoon';

export interface AccountSettingsAccordionProps {
  expandedAccordion: string | false;
  onAccordionChange: (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => void;
  isEditingProfile: boolean;
  editForm: ProfileEditFormData;
  onFormChange: (form: ProfileEditFormData) => void;
  user?: {
    displayName?: string;
    username: string;
    email: string;
    role?: 'user' | 'admin';
  };
  profile?: {
    university?: string;
    faculty?: string;
    field?: string;
    language?: string;
  };
  setEnableAppBarActions?: (enabled: boolean) => void;
  setIsEditMode?: (isEdit: boolean) => void;
  setHasUnsavedChanges?: (hasChanges: boolean) => void;
  setOnSave?: (callback: (() => void) | null) => void;
}

/**
 * アカウント設定アコーディオン
 * MyPage のアカウント設定セクション（ステータス、ウォレット、プロフィール編集）
 * 
 * プロフィール編集アコーディオン開時に、AppBar に SAVE/Preview/Edit ボタンを表示
 */
export const AccountSettingsAccordion: FC<AccountSettingsAccordionProps> = ({
  expandedAccordion,
  onAccordionChange,
  isEditingProfile,
  editForm,
  onFormChange,
  user,
  profile,
  setEnableAppBarActions,
  setIsEditMode,
  setHasUnsavedChanges,
  setOnSave,
}) => {
  // アコーディオン展開時に AppBar を制御
  useEffect(() => {
    const isProfileOpen = expandedAccordion === 'profile';

    if (setEnableAppBarActions) {
      setEnableAppBarActions(isProfileOpen);
    }

    if (setOnSave) {
      if (isProfileOpen) {
        setOnSave(() => {
          console.log('Saving profile:', editForm);
          // 実装後: API 呼び出し
        });
      } else {
        setOnSave(null);
      }
    }

    return () => {
      if (setEnableAppBarActions) {
        setEnableAppBarActions(false);
      }
      if (setOnSave) {
        setOnSave(null);
      }
    };
  }, [expandedAccordion, editForm, setEnableAppBarActions, setOnSave]);

  // 編集モード変更時に AppBar の編集モードを更新
  useEffect(() => {
    if (setIsEditMode) {
      setIsEditMode(isEditingProfile);
    }
  }, [isEditingProfile, setIsEditMode]);

  // 変更検知（プロフィール編集時）
  const profileChanged = editForm.displayName !== (user?.displayName || '') ||
    editForm.university !== (profile?.university || '') ||
    editForm.faculty !== (profile?.faculty || '') ||
    editForm.field !== (profile?.field || 'science') ||
    editForm.language !== (profile?.language || 'ja');

  useEffect(() => {
    if (setHasUnsavedChanges) {
      setHasUnsavedChanges(profileChanged && isEditingProfile);
    }
  }, [profileChanged, isEditingProfile, setHasUnsavedChanges]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Eduanimaアカウント設定
      </Typography>

      {/* ステータスアコーディオン */}
      <Accordion expanded={expandedAccordion === 'status'} onChange={onAccordionChange('status')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 500 }}>ステータス</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ComingSoon
            title="ステータス"
            minHeight="240px"
          />
        </AccordionDetails>
      </Accordion>

      {/* ウォレットアコーディオン */}
      <Accordion expanded={expandedAccordion === 'wallet'} onChange={onAccordionChange('wallet')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 500 }}>ウォレット</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ComingSoon
            title="ウォレット"
            minHeight="240px"
          />
        </AccordionDetails>
      </Accordion>

      {/* プロフィール編集アコーディオン */}
      <Accordion expanded={expandedAccordion === 'profile'} onChange={onAccordionChange('profile')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 500 }}>プロフィール編集</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            <ProfileEditForm
              isEditing={isEditingProfile}
              editForm={editForm}
              onFormChange={onFormChange}
              user={user}
              profile={profile}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AccountSettingsAccordion;
