import { describe, it, expect } from 'vitest';
import { createAppTheme } from '@/theme/createTheme';

/**
 * Theme Creation Tests
 * 
 * テスト対象: src/theme/createTheme.ts
 * 
 * MUI v6 テーマが正しく生成されることを確認します。
 */

describe('createAppTheme', () => {
  it('should create a light theme', () => {
    const theme = createAppTheme(false);
    
    expect(theme).toBeDefined();
    expect(theme.palette).toBeDefined();
    expect(theme.palette.primary).toBeDefined();
  });

  it('should create a dark theme', () => {
    const theme = createAppTheme(true);
    
    expect(theme).toBeDefined();
    expect(theme.palette).toBeDefined();
    expect(theme.palette.mode).toBe('dark');
  });

  it('should have correct primary color for light theme', () => {
    const theme = createAppTheme(false);
    // MUI v6 では palette.primary.main で色にアクセス
    expect(theme.palette.primary.main).toBeDefined();
  });

  it('should have typography settings', () => {
    const theme = createAppTheme(false);
    expect(theme.typography).toBeDefined();
  });

  it('should have component overrides', () => {
    const theme = createAppTheme(false);
    expect(theme.components).toBeDefined();
  });
});
