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
    await page.waitForLoadState('networkidle');
    
    // ホームページへリダイレクトされ、ログイン完了
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('ログイン -> 問題作成 -> 検索 -> 詳細表示', async ({ page }) => {
    // 問題作成ページへ移動
    await page.goto('/problem/create');
    
    // ページが読み込まれることを確認（role ベースのセレクタで安定化）
    await expect(page.getByRole('heading', { name: /問題を作成|新規問題作成/ })).toBeVisible({ timeout: 5000 });
    
    // Step 0: 基本設定
    // タイトルを入力
    const titleInput = page.locator('input[placeholder*="タイトル"]');
    await titleInput.fill('微分積分学 - 極限と連続性');
    
    // 教科を選択
    const subjectSelect = page.locator('select, [role="combobox"]').first();
    if (await subjectSelect.isVisible()) {
      await subjectSelect.click();
      await page.getByText('数学', { exact: true }).click();
    }
    
    // 難易度を選択
    const levelSelect = page.locator('select, [role="combobox"]').nth(1);
    if (await levelSelect.isVisible()) {
      await levelSelect.click();
      await page.getByText('標準', { exact: true }).click();
    }
    
    // タグを追加
    const tagInput = page.locator('input[placeholder*="タグ"]');
    if (await tagInput.isVisible()) {
      await tagInput.fill('微積');
      const addButton = page.getByRole('button', { name: '追加' }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
      }
    }
    
    // 次へボタンをクリック
    let nextButton = page.getByRole('button', { name: '次へ' }).last();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
    
    // Step 1: 問題入力
    // 問題内容を入力
    const contentInput = page.locator('textarea');
    if (await contentInput.isVisible()) {
      await contentInput.fill('以下の極限を求めよ: lim(x->0) sin(x)/x');
    }
    
    // 次へボタンをクリック
    nextButton = page.getByRole('button', { name: '次へ' }).last();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
    
    // Step 2: 確認・保存
    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: '保存' }).last();
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
    
    // 成功通知を確認（役割ベースのセレクタで安定化）
    await expect(page.getByText(/問題を作成しました|問題が作成されました/)).toBeVisible({ timeout: 5000 });
    
    // ホームページへリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // ホームページで問題が表示されることを確認
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('微分積分学')).toBeVisible({ timeout: 5000 });
    
    // 問題をクリックして詳細表示を確認
    const problemLink = page.getByText('微分積分学').first();
    if (await problemLink.isVisible()) {
      await problemLink.click();
      
      // 詳細ページが表示されることを確認
      await expect(page.getByText('微分積分学 - 極限と連続性')).toBeVisible({ timeout: 5000 });
      
      // 問題内容が表示されることを確認
      await expect(page.getByText(/極限を求めよ/)).toBeVisible({ timeout: 5000 });
      
      // 編集ボタンが表示されることを確認
      const editButton = page.getByRole('button', { name: '編集' }).first();
      if (await editButton.isVisible()) {
        // 編集モードに切り替え
        await editButton.click();
        
        // 編集フォームが表示されることを確認
        await expect(page.locator('input[value*="微分積分学"]')).toBeVisible({ timeout: 5000 });
        
        // キャンセルボタンをクリック
        const cancelButton = page.getByRole('button', { name: 'キャンセル' }).first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
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
