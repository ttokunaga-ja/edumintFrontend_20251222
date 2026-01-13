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
    
    // ログインボタンをクリック（フォームの submit ボタンをターゲットにする）
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    
    // ホームページへリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // 成功通知が表示されることを確認
    await expect(page.locator('text=ログインしました')).toBeVisible({ timeout: 10000 });
    
    // マイページへ移動
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // MyPageが正しく表示されたことを確認（ログアウトボタンの存在で判定）
    // テキストベースは不安定なため、role ベースのセレクタを使用
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible({ timeout: 10000 });
    
    // ユーザー情報（メールアドレス）はモックの状態に依存するため、MyPage固有の見出しで表示を確認する
    await expect(page.getByRole('heading', { name: 'Edumintアカウント設定' })).toBeVisible({ timeout: 10000 });

    // ログアウトボタンをクリック（role ベースのセレクタ、遷移を同時に待つ）
    const logoutButton = page.getByRole('button', { name: 'ログアウト' });
    if (await logoutButton.isVisible()) {
      await Promise.all([
        page.waitForURL('/login', { timeout: 10000 }),
        logoutButton.click(),
      ]);
    }
    
    // ログイン画面が表示されることを確認（フォーム内のログインボタンで判定）
    await expect(page.locator('form').getByRole('button', { name: 'ログイン' })).toBeVisible({ timeout: 10000 });
  });

  test('新規登録フロー', async ({ page }) => {
    // ログインページへ明示的に移動
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 登録タブをクリック
    const registerTab = page.locator('button:has-text("登録")').first();
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
    
    // 利用規約に同意（必須チェックボックス）
    await page.locator('input[type="checkbox"]').check();
    
    // 登録ボタンをクリック（role ベースのセレクタを使用）
    await page.getByRole('button', { name: '登録' }).last().click();
    await page.waitForLoadState('networkidle');
    
    // 登録成功後、プロフィール設定ページにリダイレクトされることを確認
    // アプリケーション実装では /profile-setup が遷移先
    await expect(page).toHaveURL('/profile-setup', { timeout: 10000 });
    
    // 成功通知が表示されることを確認
    await expect(page.getByText('登録しました！プロフィール設定へ進みます。')).toBeVisible({ timeout: 10000 });
  });
});
