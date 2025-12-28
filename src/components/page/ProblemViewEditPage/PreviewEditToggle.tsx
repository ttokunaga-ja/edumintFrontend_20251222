import React from 'react';
import { Eye, Edit } from 'lucide-react';
import { Button } from '@/components/primitives/button'; export interface PreviewEditToggleProps { isEditMode: boolean; setIsEditMode: (val: boolean) => void; disabled?: boolean; disabledReason?: string;
} export function PreviewEditToggle({ isEditMode, setIsEditMode, disabled = false, disabledReason }: PreviewEditToggleProps) { return ( <div style={{ display: }> <Button variant={!isEditMode ? 'default' : 'ghost'} size="sm" onClick={() => setIsEditMode(false)} style={{ display: undefined, alignItems: "center", gap: "0.5rem" }} > <Eye /> プレビュー </Button> <Button variant={isEditMode ? 'default' : 'ghost'} size="sm" onClick={() => !disabled && setIsEditMode(true)} disabled={disabled} style={{ display: undefined, alignItems: "center", gap: "0.5rem" }} title={disabled ? disabledReason || '編集権限が必要です' : undefined}> <Edit /> 編集モード </Button> </div> );
}
