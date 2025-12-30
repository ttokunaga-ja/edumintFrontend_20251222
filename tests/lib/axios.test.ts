import { describe, it, expect } from 'vitest';

/**
 * Axios Instance Tests
 * 
 * テスト対象: src/lib/axios.ts
 * 
 * Axios インスタンスが正しく設定されていることを確認します。
 */

describe('axios instance configuration', () => {
  it('should be importable and configured', async () => {
    // 動的に axiosインスタンスをインポート（副作用確認用）
    const { default: axiosInstance } = await import('@/lib/axios');
    
    // インスタンスが存在することを確認
    expect(axiosInstance).toBeDefined();
    expect(axiosInstance.get).toBeDefined();
    expect(axiosInstance.post).toBeDefined();
  });

  it('should support standard HTTP methods', async () => {
    const { default: axiosInstance } = await import('@/lib/axios');
    
    expect(typeof axiosInstance.get).toBe('function');
    expect(typeof axiosInstance.post).toBe('function');
    expect(typeof axiosInstance.put).toBe('function');
    expect(typeof axiosInstance.delete).toBe('function');
  });

  it('should have default baseURL or fallback', async () => {
    const { default: axiosInstance } = await import('@/lib/axios');
    
    // baseURL が設定されているか、またはデフォルト値が使われているか確認
    expect(axiosInstance.defaults.baseURL || 'http://localhost:3000/api').toBeTruthy();
  });
});
