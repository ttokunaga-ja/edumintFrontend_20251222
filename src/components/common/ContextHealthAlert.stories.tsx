// @ts-nocheck
// ========================================
// EduMint - ContextHealthAlert Stories
// 20 Variants: C1-S1 ~ C5-S4
// ========================================

import type { Meta, StoryObj } from '@storybook/react';
import { ContextHealthAlert } from './ContextHealthAlert';

const meta: Meta<typeof ContextHealthAlert> = {
  title: 'Shared/ContextHealthAlert',
  component: ContextHealthAlert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ContextHealthAlert コンポーネント - サービスヘルス状態を表示

**20 Variants**: 5カテゴリ × 4ステータス
- C1: AI生成エンジン
- C2: コンテンツサービス
- C3: コイン残高・出金
- C4: コミュニティ機能
- C5: 通知・お知らせ

**Statuses**:
- S1: operational (非表示)
- S2: degraded (200ms animation)
- S3: maintenance (250ms animation + pulse)
- S4: outage (300ms animation + shake)

**Grid**: 16px padding (p-4), 12px spacing (gap-3)
**WCAG 2.1 AA**: コントラスト比 4.5:1以上
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: [
        'AI生成エンジン',
        'コンテンツサービス',
        'コイン残高・出金',
        'コミュニティ機能',
        '通知・お知らせ',
      ],
    },
    status: {
      control: 'select',
      options: ['operational', 'degraded', 'maintenance', 'outage'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextHealthAlert>;

// ========================================
// C1: AI生成エンジン
// ========================================

export const C1_S2_AIGeneration_Degraded: Story = {
  name: 'C1-S2: AI生成 - Degraded',
  args: {
    id: 'alert-c1-s2',
    category: 'AI生成エンジン',
    status: 'degraded',
    message: '現在、AI生成エンジンに負荷がかかっており、通常より処理に時間がかかる場合があります。',
  },
};

export const C1_S3_AIGeneration_Maintenance: Story = {
  name: 'C1-S3: AI生成 - Maintenance',
  args: {
    id: 'alert-c1-s3',
    category: 'AI生成エンジン',
    status: 'maintenance',
    message: 'AI生成エンジンのメンテナンスを実施しています。まもなく復旧します。',
    disableCTA: true,
  },
};

export const C1_S4_AIGeneration_Outage: Story = {
  name: 'C1-S4: AI生成 - Outage',
  args: {
    id: 'alert-c1-s4',
    category: 'AI生成エンジン',
    status: 'outage',
    message: 'AI生成エンジンに障害が発生しています。現在、問題生成機能がご利用いただけません。',
    action: {
      label: '再試行',
      onClick: () => console.log('Retry clicked'),
    },
    disableCTA: true,
  },
};

// ========================================
// C2: コンテンツサービス
// ========================================

export const C2_S2_Content_Degraded: Story = {
  name: 'C2-S2: コンテンツ - Degraded',
  args: {
    id: 'alert-c2-s2',
    category: 'コンテンツサービス',
    status: 'degraded',
    message: 'コンテンツの読み込みに遅延が発生しています。',
  },
};

export const C2_S4_Content_Outage: Story = {
  name: 'C2-S4: コンテンツ - Outage',
  args: {
    id: 'alert-c2-s4',
    category: 'コンテンツサービス',
    status: 'outage',
    message: 'コンテンツの読み込みに失敗しました。しばらく時間をおいてから再度お試しください。',
    action: {
      label: '再試行',
      onClick: () => console.log('Retry content loading'),
    },
  },
};

// ========================================
// C3: コイン残高・出金
// ========================================

export const C3_S2_Coin_Degraded: Story = {
  name: 'C3-S2: コイン残高 - Degraded',
  args: {
    id: 'alert-c3-s2',
    category: 'コイン残高・出金',
    status: 'degraded',
    message: 'コイン残高の更新に遅延が発生しています。',
  },
};

export const C3_S4_Coin_Outage: Story = {
  name: 'C3-S4: コイン残高 - Outage',
  args: {
    id: 'alert-c3-s4',
    category: 'コイン残高・出金',
    status: 'outage',
    message: '出金機能が一時的に停止しています。システム復旧後に再度お試しください。',
    disableCTA: true,
  },
};

// ========================================
// C4: コミュニティ機能
// ========================================

export const C4_S2_Community_Degraded: Story = {
  name: 'C4-S2: コミュニティ - Degraded',
  args: {
    id: 'alert-c4-s2',
    category: 'コミュニティ機能',
    status: 'degraded',
    message: '現在、いいね・コメント機能に遅延が発生しています。しばらく時間をおいてから再度お試しください。',
    disableCTA: true,
  },
};

export const C4_S3_Community_Maintenance: Story = {
  name: 'C4-S3: コミュニティ - Maintenance',
  args: {
    id: 'alert-c4-s3',
    category: 'コミュニティ機能',
    status: 'maintenance',
    message: 'コミュニティ機能のメンテナンスを実施しています。',
    disableCTA: true,
  },
};

export const C4_S4_Community_Outage: Story = {
  name: 'C4-S4: コミュニティ - Outage',
  args: {
    id: 'alert-c4-s4',
    category: 'コミュニティ機能',
    status: 'outage',
    message: 'コミュニティ機能に障害が発生しています。一時的にご利用いただけません。',
    disableCTA: true,
  },
};

// ========================================
// C5: 通知・お知らせ
// ========================================

export const C5_S2_Notification_Degraded: Story = {
  name: 'C5-S2: 通知 - Degraded',
  args: {
    id: 'alert-c5-s2',
    category: '通知・お知らせ',
    status: 'degraded',
    message: '通知の送信に遅延が発生しています。',
  },
};

export const C5_S4_Notification_Outage: Story = {
  name: 'C5-S4: 通知 - Outage',
  args: {
    id: 'alert-c5-s4',
    category: '通知・お知らせ',
    status: 'outage',
    message: '現在、通知機能が停止しているため、共有リンクの通知が送信されません。システム復旧後に自動的に送信されます。',
    action: {
      label: 'ステータスページを見る',
      onClick: () => window.open('https://status.edumint.example.com', '_blank'),
    },
  },
};

// ========================================
// Multiple Alerts Demo
// ========================================

export const MultipleAlerts: Story = {
  name: '複数アラート同時表示',
  render: () => (
    <div >
      <ContextHealthAlert
        id="alert-1"
        category="コミュニティ機能"
        status="degraded"
        message="現在、いいね・コメント機能に遅延が発生しています。"
        disableCTA={true}
      />
      <ContextHealthAlert
        id="alert-2"
        category="通知・お知らせ"
        status="outage"
        message="通知機能が停止しています。"
        action={{
          label: '詳細を見る',
          onClick: () => console.log('View details'),
        }}
      />
    </div>
  ),
};

// ========================================
// With Close Button
// ========================================

export const WithCloseButton: Story = {
  name: 'クローズボタン付き',
  args: {
    id: 'alert-closable',
    category: 'AI生成エンジン',
    status: 'degraded',
    message: 'AI生成に遅延が発生しています。',
    onClose: () => console.log('Alert closed'),
  },
};
