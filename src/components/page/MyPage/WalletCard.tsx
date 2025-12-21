// @ts-nocheck
import { useState } from 'react';
import { Wallet, TrendingUp, Download, ExternalLink } from 'lucide-react';

export type WalletBalance = {
  balance: number;
  currency: string;
  pendingEarnings: number;
  totalEarnings: number;
  lastUpdated: string;
};

export type WalletCardProps = {
  balance?: WalletBalance;
  isLoading?: boolean;
  onWithdraw?: () => void;
  className?: string;
  disableWithdrawal?: boolean; // Add disable prop for health-based disabling
};

export function WalletCard({ balance, isLoading = false, onWithdraw, className = '', disableWithdrawal = false }: WalletCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white ${className} animate-pulse`}>
        <div className="h-6 bg-white/30 rounded w-24 mb-4"></div>
        <div className="h-10 bg-white/30 rounded w-32 mb-6"></div>
        <div className="h-10 bg-white/30 rounded"></div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl shadow-lg p-6 text-white ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5" />
          <h3 className="font-medium">ウォレット</h3>
        </div>
        <p className="text-white/80 text-sm mb-4">
          ウォレット機能は準備中です
        </p>
        <div className="p-3 bg-white/20 rounded-lg text-sm">
          Phase2でリリース予定
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <h3 className="font-medium">ウォレット残高</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-white/80 hover:text-white transition-colors"
        >
          {showDetails ? '閉じる' : '詳細'}
        </button>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold mb-1">
          ¥{balance.balance.toLocaleString()}
        </div>
        <div className="text-sm text-white/80">
          利用可能残高
        </div>
      </div>

      {showDetails && (
        <div className="space-y-3 mb-6 p-4 bg-white/10 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">保留中の収益</span>
            <span className="font-medium">¥{balance.pendingEarnings.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">累計収益</span>
            <span className="font-medium">¥{balance.totalEarnings.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">最終更新</span>
            <span className="font-medium">
              {new Date(balance.lastUpdated).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onWithdraw}
          disabled={balance.balance < 1000 || disableWithdrawal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">出金</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">統計</span>
        </button>
      </div>

      {balance.balance < 1000 && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs text-white/80">
          ※ 出金には最低¥1,000の残高が必要です
        </div>
      )}

      <a
        href="#"
        className="flex items-center justify-center gap-1 mt-4 text-xs text-white/80 hover:text-white transition-colors"
      >
        <span>収益について詳しく</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
