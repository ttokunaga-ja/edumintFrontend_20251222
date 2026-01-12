import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('ログイン -> マイページ確認 -> ログアウト', async ({ page }) => {
    // ログインページへ明示的に移動
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // ログインフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    
    // メールアドレスを入力
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    
    // パスワードを入力
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('password123');
    
    // ログインボタンをクリック
    const loginButton = page.locator('button:has-text("ログイン")').first();
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    
    // ホームページへリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // 成功通知が表示されることを確認
    await expect(page.locator('text=ログインしました')).toBeVisible({ timeout: 10000 });
    
    // マイページへ移動
    await page.goto('/mypage');
    
    // マイページが表示されることを確認
    await expect(page.locator('text=マイページ')).toBeVisible({ timeout: 5000 });
    
    // ユーザー情報が表示されることを確認
    await expect(page.locator('text=test@example.com')).toBeVisible({ timeout: 5000 });
    
    // ログアウトボタンをクリック
    const logoutButton = page.locator('button:has-text("ログアウト")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // ログアウト後、ホームページへリダイレクトされることを確認
    await expect(page).toHaveURL('/');
  });

  test('新規登録フロー', async ({ page }) => {
    // ログインページへ明示的に移動
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 登録タブをクリック
    const registerTab = page.locator('button[role="tab"]:has-text("登録")');
    await expect(registerTab).toBeVisible({ timeout: 10000 });
    await registerTab.click();
    
    // 登録フォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    
    // メールアドレスを入力
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('newuser@example.com');
    
    // ユーザー名を入力
    const usernameInput = page.locator('input[placeholder*="ユーザー名"]');
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('newuser');
    }
    
    // パスワードを入力
    const passwordInputs = page.locator('input[type="password"]');
    const firstPassword = passwordInputs.first();
    await firstPassword.fill('password123');
    
    // パスワード確認を入力
    const confirmPasswordInput = passwordInputs.nth(1);
    await confirmPasswordInput.fill('password123');
    
    // 登録ボタンをクリック
    const registerButton = page.locator('button:has-text("登録")').last();
    await registerButton.click();
    await page.waitForLoadState('networkidle');
    
    // ホームページへリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // 成功通知が表示されることを確認
    await expect(page.locator('text=登録しました')).toBeVisible({ timeout: 10000 });
  });
});
