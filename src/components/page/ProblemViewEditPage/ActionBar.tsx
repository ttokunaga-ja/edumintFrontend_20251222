import React from 'react';
import { Button } from '@/components/primitives/button';
import { Save, X, RotateCcw } from 'lucide-react';

export interface ActionBarProps {
    isEditing: boolean;
    onSave: () => void;
    onCancel: () => void;
    onReset?: () => void;
    isSaving?: boolean;
}

export function ActionBar({
    isEditing,
    onSave,
    onCancel,
    onReset,
    isSaving = false,
}: ActionBarProps) {
    if (!isEditing) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    編集モード：変更内容は「保存」するまで反映されません。
                </div>
                <div className="flex gap-3">
                    {onReset && (
                        <Button variant="outline" onClick={onReset} disabled={isSaving}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            元に戻す
                        </Button>
                    )}
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                        <X className="w-4 h-4 mr-2" />
                        キャンセル
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? '保存中...' : '変更を保存'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
