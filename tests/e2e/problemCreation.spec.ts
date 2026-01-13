import { test, expect } from '@playwright/test';

test.describe('Exam Editing Flow - Global Save Only', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン済み状態をセットアップ
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
    
    // ホームページへリダイレクト
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('should navigate to /problem/:id and load ExamPage', async ({ page }) => {
    // Navigate to exam edit page
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    // Verify ExamPage loads (check for exam title or form elements)
    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Verify form elements are present
    await expect(page.locator('input[placeholder*="試験名"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('textarea[placeholder*="説明"]')).toBeVisible({ timeout: 10000 });
  });

  test('should add and remove questions using global form', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Count initial questions
    const initialQuestionCount = await page.locator('[data-testid="question-item"]').count();

    // Click add question button
    await page.getByRole('button', { name: '大問を追加' }).click();
    await page.waitForLoadState('networkidle');

    // Verify question count increased
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount + 1, { timeout: 10000 });

    // Click delete button on the new question
    const deleteButtons = page.getByRole('button', { name: '削除' });
    await deleteButtons.last().click();
    await page.waitForLoadState('networkidle');

    // Verify question count returned to initial
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount, { timeout: 10000 });
  });

  test('should add and remove subquestions', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Count initial subquestions in first question
    const initialSubQuestionCount = await page.locator('[data-testid="subquestion-item"]').count();

    // Click add subquestion button
    await page.getByRole('button', { name: '小問を追加' }).click();
    await page.waitForLoadState('networkidle');

    // Verify subquestion count increased
    await expect(page.locator('[data-testid="subquestion-item"]')).toHaveCount(initialSubQuestionCount + 1, { timeout: 10000 });

    // Delete the new subquestion
    const deleteButtons = page.getByRole('button', { name: '削除' });
    await deleteButtons.last().click();
    await page.waitForLoadState('networkidle');

    // Verify count returned
    await expect(page.locator('[data-testid="subquestion-item"]')).toHaveCount(initialSubQuestionCount, { timeout: 10000 });
  });

  test('should change question type and show appropriate editor', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Find question type selector (assuming it's a select or radio buttons)
    const questionTypeSelect = page.locator('select[name*="questionType"]').first();
    await expect(questionTypeSelect).toBeVisible({ timeout: 10000 });

    // Change to selection type (ID 1)
    await questionTypeSelect.selectOption('1');
    await page.waitForLoadState('networkidle');

    // Verify selection editor appears
    await expect(page.getByText('選択肢')).toBeVisible({ timeout: 10000 });

    // Change to matching type (ID 4)
    await questionTypeSelect.selectOption('4');
    await page.waitForLoadState('networkidle');

    // Verify matching editor appears
    await expect(page.getByText('マッチング')).toBeVisible({ timeout: 10000 });
  });

  test('should save entire exam via TopMenuBar', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Modify exam title
    await page.fill('input[placeholder*="試験名"]', 'Modified Exam Title');

    // Verify TopMenuBar save button is enabled (has unsaved changes)
    const saveButton = page.getByRole('button', { name: '保存' });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });

    // Click save (this would trigger the global save)
    await saveButton.click();
    await page.waitForLoadState('networkidle');

    // Verify save success (assuming success message or redirect)
    // This depends on the actual UI implementation
    await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 });
  });

  test('should block save when validation fails', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('試験編集', { timeout: 10000 });

    // Clear required title field
    await page.fill('input[placeholder*="試験名"]', '');

    // Try to save
    const saveButton = page.getByRole('button', { name: '保存' });
    await saveButton.click();
    await page.waitForLoadState('networkidle');

    // Verify validation error is shown
    await expect(page.getByText('必須項目です')).toBeVisible({ timeout: 10000 });

    // Verify save was blocked
    await expect(page.getByText('保存しました')).not.toBeVisible();
  });

  test('TopMenuBar should be opaque and have high z-index', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');
    await page.waitForLoadState('networkidle');

    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 10000 });

    const backgroundColor = await navbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(255, 255, 255)'); // bg-white

    const zIndex = await navbar.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBe(10);
  });
});
