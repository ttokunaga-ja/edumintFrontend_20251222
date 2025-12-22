import React from 'react';
import { Bell, Heart, MessageSquare, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/utils';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'system' | 'report';
    content: string;
    date: string;
    isRead: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'like',
        content: 'いいねされました - 佐藤花子さんがあなたの問題「微分積分学 - 第3章 演習問題」にいいねしました',
        date: '2025/11/20',
        isRead: false
    },
    {
        id: '2',
        type: 'comment',
        content: '新しいコメント - 鈴木一郎さんがあなたの問題にコメントしました：「とてもわかりやすい解説でした！」',
        date: '2025/11/20',
        isRead: false
    },
    {
        id: '3',
        type: 'like',
        content: 'いいねされました - 山田太郎さんがあなたの問題「線形代数 - 固有値と固有ベクトル」にいいねしました',
        date: '2025/11/20',
        isRead: true
    },
    {
        id: '4',
        type: 'system',
        content: 'システム通知 - 新機能：問題編集機能が追加されました。マイページから過去の投稿を編集できるようになりました。',
        date: '2025/11/19',
        isRead: true
    },
    {
        id: '5',
        type: 'report',
        content: '報告の処理完了 - 報告いただいた問題について確認が完了しました。ご協力ありがとうございました。',
        date: '2025/11/18',
        isRead: true
    }
];

interface NotificationPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />;
            case 'comment': return <MessageSquare className="h-4 w-4 text-indigo-500" />;
            case 'system': return <Info className="h-4 w-4 text-blue-500" />;
            case 'report': return <CheckCircle className="h-4 w-4 text-orange-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div
            id="notifications-popover"
            data-notifications="true"
            className={cn(
                "fixed top-16 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 origin-top-right",
                isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
            )}
            style={{ visibility: isOpen ? 'visible' : 'hidden' }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">通知</h3>
            </div>

            <div className="p-8 text-center bg-gray-50/50">
                <div className="mx-auto w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Coming Soon</h3>
                <p className="text-sm text-gray-500">
                    通知機能は現在開発中です。<br />
                    今後のアップデートをお待ちください。
                </p>
            </div>
        </div>
    );
}
