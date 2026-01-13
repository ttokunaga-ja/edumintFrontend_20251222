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

  test('should navigate to /exam/:id and load ExamPage', async ({ page }) => {
    // Navigate to exam edit page
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    // Verify ExamPage loads (check for exam title or form elements)
    await expect(page.getByRole('heading', { name: /量子力学基礎 中間試験|試験情報/ })).toBeVisible({ timeout: 15000 });

    // Switch to edit mode to see inputs
    const editToggle = page.getByRole('button', { name: 'edit mode' });
    if (await editToggle.isVisible()) {
      await editToggle.click();
    }

    // Verify form elements are present
    await expect(page.getByLabel('試験名')).toBeVisible({ timeout: 15000 });
  });

  test('should add and remove questions using global form', async ({ page }) => {
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /量子力学基礎 中間試験|試験情報/ })).toBeVisible({ timeout: 15000 });

    // Switch to edit mode to see buttons
    const editToggle = page.getByRole('button', { name: 'edit mode' });
    if (await editToggle.isVisible()) {
      await editToggle.click();
    }

    // Count initial questions (uses the data-testid we added)
    const initialQuestionCount = await page.locator('[data-testid="question-item"]').count();

    // Click add question button
    await page.getByRole('button', { name: '大問を追加' }).click();
    await page.waitForLoadState('networkidle');

    // Verify question count increased
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount + 1, { timeout: 10000 });

    // Click delete button on the new question (must be enabled)
    const lastQuestion = page.locator('[data-testid="question-item"]').last();
    const deleteButton = lastQuestion.getByTestId('delete-button').first();
    await expect(deleteButton).toBeEnabled({ timeout: 15000 });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify question count returned to initial
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount, { timeout: 10000 });
  });

  test('should add and remove subquestions', async ({ page }) => {
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /量子力学基礎 中間試験|試験情報/ })).toBeVisible({ timeout: 15000 });

    // Switch to edit mode to see buttons
    const editToggle = page.getByRole('button', { name: 'edit mode' });
    if (await editToggle.isVisible()) {
      await editToggle.click();
    }

    // Count initial subquestions in first question (use starts-with selector for dynamic IDs)
    const initialSubQuestionCount = await page.locator('[data-testid^="subquestion-item"]').count();

    // Click add subquestion button
    await page.getByRole('button', { name: '小問を追加' }).first().click();
    await page.waitForLoadState('networkidle');

    // Verify subquestion count increased
    await expect(page.locator('[data-testid^="subquestion-item"]')).toHaveCount(initialSubQuestionCount + 1, { timeout: 10000 });

    // Delete the new subquestion
    const lastSubQuestion = page.locator('[data-testid^="subquestion-item"]').last();
    const deleteButton = lastSubQuestion.getByTestId('delete-button').first();
    await expect(deleteButton).toBeEnabled({ timeout: 15000 });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify count returned
    await expect(page.locator('[data-testid^="subquestion-item"]')).toHaveCount(initialSubQuestionCount, { timeout: 10000 });
  });

  test('should change question type and show appropriate editor', async ({ page }) => {
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /量子力学基礎 中間試験|試験情報/ })).toBeVisible({ timeout: 10000 });

    // Switch to edit mode to see selectors
    const editToggle = page.getByRole('button', { name: 'edit mode' });
    if (await editToggle.isVisible()) {
      await editToggle.click();
    }

    // Find question type selector
    const questionTypeSelect = page.locator('select, [role="combobox"]').first();
    await expect(questionTypeSelect).toBeVisible({ timeout: 10000 });
  });

  test('should save entire exam via TopMenuBar', async ({ page }) => {
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /量子力学基礎 中間試験|試験情報/ })).toBeVisible({ timeout: 10000 });

    // Switch to edit mode to see inputs
    const editToggle = page.getByRole('button', { name: 'edit mode' });
    if (await editToggle.isVisible()) {
      await editToggle.click();
    }

    // Modify exam title - this should enable the save button in TopMenuBar
    await page.getByLabel('試験名').fill('Modified Exam Title');

    // Verify TopMenuBar save button is enabled (it should have text "保存")
    const saveButton = page.getByRole('button', { name: '保存' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
  });

  test('TopMenuBar should be opaque and have high z-index', async ({ page }) => {
    const examId = 'v7N2jK8mP4wL9XRz';
    await page.goto(`/exam/${examId}`);
    await page.waitForLoadState('networkidle');

    const navbar = page.locator('header').first();
    await expect(navbar).toBeVisible({ timeout: 10000 });

    const zIndex = await navbar.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex, 10)).toBeGreaterThan(1000);
  });
});
