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
      <div >
        <div ></div>
        <div ></div>
        <div ></div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div >
        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
          <Wallet  />
          <h3 >ウォレット</h3>
        </div>
        <p >
          ウォレット機能は準備中です
        </p>
        <div >
          Phase2でリリース予定
        </div>
      </div>
    );
  }

  return (
    <div >
      <div style={{
      display: "flex",
      alignItems: "center"
    }>
        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
          <Wallet  />
          <h3 >ウォレット残高</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          
        >
          {showDetails ? '閉じる' : '詳細'}
        </button>
      </div>

      <div >
        <div >
          ¥{balance.balance.toLocaleString()}
        </div>
        <div >
          利用可能残高
        </div>
      </div>

      {showDetails && (
        <div >
          <div style={{
      display: "flex",
      alignItems: "center"
    }>
            <span >保留中の収益</span>
            <span >¥{balance.pendingEarnings.toLocaleString()}</span>
          </div>
          <div style={{
      display: "flex",
      alignItems: "center"
    }>
            <span >累計収益</span>
            <span >¥{balance.totalEarnings.toLocaleString()}</span>
          </div>
          <div style={{
      display: "flex",
      alignItems: "center"
    }>
            <span >最終更新</span>
            <span >
              {new Date(balance.lastUpdated).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      )}

      <div style={{
      gap: "0.75rem"
    }>
        <button
          onClick={onWithdraw}
          disabled={balance.balance < 1000 || disableWithdrawal}
          style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
        >
          <Download  />
          <span >出金</span>
        </button>
        <button style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }>
          <TrendingUp  />
          <span >統計</span>
        </button>
      </div>

      {balance.balance < 1000 && (
        <div >
          ※ 出金には最低¥1,000の残高が必要です
        </div>
      )}

      <a
        href="#"
        style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.25rem"
    }}
      >
        <span>収益について詳しく</span>
        <ExternalLink  />
      </a>
    </div>
  );
}
