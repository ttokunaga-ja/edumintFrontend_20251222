import React, { useEffect, useRef } from 'react';
import { Home, Plus, User, X, LogOut } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { Page } from '@/types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: string;
    onNavigate: (page: Page) => void;
}

export default function Sidebar({ isOpen, onClose, currentPage, onNavigate }: SidebarProps) {
    const menuItems = [
        { id: 'home', label: 'ホーム', icon: Home },
        { id: 'problem-create', label: '投稿', icon: Plus },
        { id: 'my-page', label: 'マイページ', icon: User },
    ];

    if (!isOpen) {
        // Keep mounted for animation, but verify visibility control in the returned JSX
    }

    const handleNavigate = (page: Page) => {
        onClose();
        onNavigate(page);
    };

    return (
        <aside
            id="sidebar-overlay"
            data-sidebar="true"
            className={cn(
                "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white shadow-2xl transition-all duration-300 ease-in-out transform",
                isOpen ? "translate-x-0 opacity-100 visible" : "-translate-x-full opacity-0 invisible pointer-events-none"
            )}
            style={{ visibility: isOpen ? 'visible' : 'hidden' }}
            onClick={(e) => e.stopPropagation()}
            aria-label="メインメニュー"
        >


            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id as Page)}
                            className={cn(
                                "flex items-center w-full gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
