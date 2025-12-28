import React, { useEffect, useMemo, useRef } from 'react';
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
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const supportsPopover = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return 'showPopover' in HTMLElement.prototype;
    }, []);
    const menuItems = [
        { id: 'home', label: 'ホーム', icon: Home },
        { id: 'problem-create', label: '投稿', icon: Plus },
        { id: 'my-page', label: 'マイページ', icon: User },
    ];

    const handleNavigate = (page: Page) => {
        onClose();
        onNavigate(page);
    };

    useEffect(() => {
        if (!supportsPopover) return;
        const node = popoverRef.current as any;
        if (!node) return;

        if (isOpen) {
            node.showPopover?.();
        } else {
            node.hidePopover?.();
        }
    }, [supportsPopover, isOpen]);

    useEffect(() => {
        if (!supportsPopover) return;
        const node = popoverRef.current;
        if (!node) return;

        const handleToggle = (event: any) => {
            if (event?.newState === 'closed') {
                onClose();
            }
        };

        node.addEventListener('toggle', handleToggle as EventListener);
        return () => node.removeEventListener('toggle', handleToggle as EventListener);
    }, [supportsPopover, onClose]);

    if (supportsPopover) {
        return (
            <div
                id="sidebar-overlay"
                ref={popoverRef}
                // @ts-ignore -- popover is a native attribute not yet in TypeScript DOM typings
                popover="auto"
                data-sidebar="true"
                className={cn(
                    "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-2xl transition-all duration-300 ease-in-out transform",
                    "origin-left [popover-open]:translate-x-0 [popover-open]:opacity-100",
                    "opacity-0 -translate-x-full"
                )}
                role="navigation"
                aria-label="メインメニュー"
                onClick={(e) => e.stopPropagation()}
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
            </div>
        );
    }

    return (
        <aside
            id="sidebar-overlay"
            data-sidebar="true"
            className={cn(
                "fixed top-16 left-0 z-app-bar h-[calc(100vh-4rem)] w-64 bg-white shadow-2xl transition-all duration-300 ease-in-out transform",
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
                            aria-current={isActive ? "page" : undefined}>
                            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
