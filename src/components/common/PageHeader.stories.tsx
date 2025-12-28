// @ts-nocheck
// ========================================
// EduMint - PageHeader Stories
// ======================================== import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { BookOpen, Eye } from 'lucide-react';
import { Badge } from '@/components/primitives/badge'; const meta: Meta<typeof PageHeader> = { title: 'Shared/PageHeader', component: PageHeader, parameters: { layout: 'fullscreen', docs: { description: { component: undefined, }, }, }, tags: ['autodocs'],
}; export default meta;
type Story = StoryObj<typeof PageHeader>; // ========================================
// HomePage Variant
// ======================================== export const HomePage: Story = { name: 'HomePage', args: { title: '問題を探す', subtitle: '全 12,345 件の問題から検索', },
}; // ========================================
// ProblemView Variant (Desktop)
// ======================================== export const ProblemView: Story = { name: 'ProblemView (Desktop)', args: { backButton: { label: '問題一覧に戻る', onClick: () => console.log('Navigate to home'), }, title: '微分積分学の基礎問題', tags: [ { icon: <BookOpen />, label: '数学', variant: 'outline' }, { label: '東京大学', variant: 'secondary' }, { label: '理学部', variant: 'secondary' }, { icon: <Eye />, label: '1,234 閲覧' }, ], statusBadges: <Badge variant="secondary">広告なし</Badge>, },
}; // ========================================
// ProblemView Variant (Mobile)
// ======================================== export const ProblemViewMobile: Story = { name: 'ProblemView (Mobile)', args: { ...ProblemView.args, }, parameters: { viewport: { defaultViewport: 'mobile1', }, },
}; // ========================================
// Long Title (Overflow Test)
// ======================================== export const LongTitle: Story = { name: 'Long Title (改行テスト)', args: { backButton: { label: '問題一覧に戻る', onClick: () => console.log('Navigate to home'), }, title: 'これは非常に長いタイトルで改行テストを行うためのものです。微分積分学における極限の概念と連続性の理論的基盤についての詳細な演習問題集', tags: [ { label: '数学', variant: 'outline' }, { label: '東京大学', variant: 'secondary' }, { label: '理学部', variant: 'secondary' }, { label: '工学部', variant: 'secondary' }, { label: '情報理工学系研究科', variant: 'secondary' }, ], },
}; // ========================================
// With Initial Ad Badge
// ======================================== export const WithAdBadge: Story = { name: 'With Ad Badge (初回広告)', args: { backButton: { label: '問題一覧に戻る', onClick: () => console.log('Navigate to home'), }, title: '線形代数の演習問題', tags: [ { icon: <BookOpen />, label: '数学' }, { label: '京都大学', variant: 'secondary' }, ], statusBadges: <Badge variant="warning">初回広告あり</Badge>, },
}; // ========================================
// Minimal (Title Only)
// ======================================== export const Minimal: Story = { name: 'Minimal (Title Only)', args: { title: 'シンプルなページ', },
}; // ========================================
// With Multiple Status Badges
// ======================================== export const MultipleStatusBadges: Story = { name: 'Multiple Status Badges', args: { title: '特別な問題集', subtitle: '複数のステータスを持つ例', statusBadges: ( <> <Badge variant="success">新着</Badge> <Badge variant="secondary">人気</Badge> <Badge variant="warning">期間限定</Badge> </> ), },
};
