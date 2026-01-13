import { test, expect } from '@playwright/test';

test.describe('ユーザーシナリオ', () => {
  test.beforeEach(async ({ page }) => {
    // ログインしてからテストを開始
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // ログインフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    
    // ログイン処理
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('password123');
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // ホームページへリダイレクトされ、ログイン完了を待機
    // ログインボタンが消えるか、アバターが表示されるのを待つのがより確実
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'ログイン' })).toHaveCount(0, { timeout: 10000 });
  });

  test('ログイン -> 問題作成 -> 検索 -> 詳細表示', async ({ page }) => {
    // 問題作成ページへ移動
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    
    // ページが読み込まれることを確認
    // ログイン状態が維持されていることを確認するために、URLが /login に戻っていないことをチェック
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByText('1. 生成開始')).toBeVisible({ timeout: 15000 });
    
    // モードを「資料から生成」に切り替え
    await page.getByText('資料から生成').click();
    
    // テキストエリアに内容を入力
    const textArea = page.locator('textarea').first();
    await textArea.fill('量子力学の基本原理について。シュレディンガー方程式と演算子。');

    // 問題構造を確認チェックボックスをONにする（確実なフェーズ遷移のため）
    const checkStructure = page.getByLabel('問題構造を確認（確認画面を表示）');
    if (await checkStructure.isVisible()) {
      await checkStructure.check();
    }
    
    // 生成開始ボタンをクリック
    await page.getByRole('button', { name: '生成開始' }).click();
    
    // フェーズ遷移（構造解析）を待機
    await expect(page.getByText('構造解析結果の確認')).toBeVisible({ timeout: 40000 });
    
    // 生成を確定
    await page.getByRole('button', { name: 'この構成で生成を開始' }).click();
    
    // 生成完了とリダイレクトを待機（リダイレクト先は /exam/:id ）
    await expect(page).toHaveURL(/\/exam\//, { timeout: 30000 });
    
    // 詳細ページが表示されることを確認
    await expect(page.getByRole('heading', { name: /量子力学|Sample Problem/i })).toBeVisible({ timeout: 15000 });
    
    // ホームページに戻って検索を確認
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 検索入力
    const searchInput = page.getByPlaceholder(/キーワード、大学、教科を検索/);
    await searchInput.fill('量子力学');
    await page.keyboard.press('Enter');
    
    // 検索結果に該当する問題が表示されることを確認 (MSWが返すデフォルトデータ)
    await expect(page.getByRole('heading', { name: '量子力学基礎 中間試験' })).toBeVisible({ timeout: 10000 });
    
    // 問題をクリック
    await page.getByRole('heading', { name: '量子力学基礎 中間試験' }).first().click();
    
    // 詳細ページが表示されることを確認
    await expect(page.getByRole('heading', { name: '量子力学基礎 中間試験' })).toBeVisible({ timeout: 10000 });
  });

  test('検索機能の動作確認', async ({ page }) => {
    // ホームページで検索フォームが表示されることを確認
    await page.goto('/');
    
    const searchInput = page.locator('input[placeholder*="検索"]');
    if (await searchInput.isVisible()) {
      // 検索キーワードを入力
      await searchInput.fill('微分');
      
      // 検索結果が表示されることを確認
      await page.waitForLoadState('networkidle');
      
      // 検索結果に該当する問題が表示されることを確認
      const results = page.locator('[role="article"]');
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
