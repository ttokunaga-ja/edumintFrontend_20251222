import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/primitives/button';

export interface TopMenuBarProps {
    currentUser?: any;
    currentPage?: string;
    onLogout?: () => void;
    onNavigate?: (page: any, problemId?: string) => void;
    onQueryChange?: (query: string) => void;
    onSearchSubmit?: () => void;
    onMenuClick?: () => void;
    onNotificationClick?: () => void;
    searchQuery?: string;
}

const SearchInput = ({
    value,
    onChange,
    onKeyDown,
    className
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
}) => (
    <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
            type="text"
            value={value}
            placeholder="問題を検索..."
            style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
            onChange={onChange}
            onKeyDown={onKeyDown} />
    </div>
);

export default function TopMenuBar({
    currentUser,
    onLogout,
    onNavigate,
    onQueryChange,
    onSearchSubmit,
    onMenuClick,
    onNotificationClick,
    searchQuery = ""
}: TopMenuBarProps) {
    const user = currentUser;
    const [localQuery, setLocalQuery] = useState(searchQuery);

    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalQuery(val);
        onQueryChange?.(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearchSubmit?.();
        }
    };

    return (
        <nav className="sticky top-0 z-app-bar w-full border-b border-gray-200 bg-white">
            <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
                {/* Main Nav Row */}
                <div style={{
      display: "flex",
      alignItems: "center"
    }>
                    {/* Left Section: Hamburger & Logo */}
                    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                        <Button variant="ghost" size="icon" className="text-gray-500" title="メニュー" data-trigger="menu-button" onClick={onMenuClick}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate?.('home')}>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent">
                                Edumint
                            </span>
                        </div>
                    </div>

                    {/* Center Section: Search (Desktop only) */}
                    <div style={{
      justifyContent: "center"
    }>
                        <SearchInput
                            className="w-full"
                            value={localQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Right Section: Actions */}
                    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-800 hover:bg-blue-50"
                            onClick={() => onNavigate?.('problem-create')}
                            title="問題をアップロード"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>

                        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100" data-trigger="notification-bell" onClick={onNotificationClick}>
                            <Bell className="h-5 w-5" />
                        </Button>

                        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                            <div className="hidden lg:block text-right mr-1">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                    {user?.username || 'ゲストユーザー'}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 p-0 overflow-hidden" onClick={() => onNavigate?.('my-page')}>
                                <User className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Row (visible only on small screens) */}
                <div className="md:hidden pb-4">
                    <SearchInput
                        className="w-full"
                        value={localQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
        </nav>
    );
}

// named export for testing compatibility
export { TopMenuBar };
