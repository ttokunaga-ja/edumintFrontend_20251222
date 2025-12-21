import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ja-JP').format(new Date(date));
}

export function getDifficultyLabel(diff: number): string {
  switch (diff) {
    case 1: return '基礎';
    case 2: return '標準';
    case 3: return '発展';
    case 4: return '難関';
    default: return '未設定';
  }
}

export function getDifficultyColor(diff: number): string {
  switch (diff) {
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-blue-100 text-blue-800';
    case 3: return 'bg-orange-100 text-orange-800';
    case 4: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
