import { x, type ClassValue } from 'x'; export function formatNumber(n: number): string { return new Intl.NumberFormat().format(n);
} export function formatDate(date: string | Date): string { return new Intl.DateTimeFormat('ja-JP').format(new Date(date));
} export function getDifficultyLabel(diff: number): string { switch (diff) { case 1: return '基礎'; case 2: return '標準'; case 3: return '発展'; case 4: return '難関'; default: return '未設定'; }
} export function getDifficultyColor(diff: number): string { switch (diff) { case 1: return ; case 2: return ; case 3: return ; case 4: return ; default: return ; }
}
