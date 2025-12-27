import { type ClassValue, clsx } from 'clsx';

// Simple className merge (tailwind-merge removed as Tailwind is deprecated)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
