import React from 'react';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/primitives/button';

export interface TopMenuBarProps {
    currentUser?: any;
    currentPage?: string;
    onLogout?: () => void;
    onNavigate?: (page: any, problemId?: string) => void;
    onSearch?: (query: string) => void;
}

export default function TopMenuBar({ currentUser, currentPage, onLogout, onNavigate, onSearch }: TopMenuBarProps) {
    const user = currentUser; // Maintain internal user variable if needed or just use currentUser
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate?.('home')}>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Edumint
                            </span>
                        </div>

                        <div className="hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="問題を検索..."
                                    className="w-80 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-gray-500">
                            <Bell className="h-5 w-5" />
                        </Button>

                        <div className="h-8 w-[1px] bg-gray-200 mx-2" />

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.username || 'ゲストユーザー'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {user?.university || '未設定'}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
                                <User className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onLogout} title="ログアウト">
                                <LogOut className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
