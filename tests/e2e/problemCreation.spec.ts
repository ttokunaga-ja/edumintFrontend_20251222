import { test, expect } from '@playwright/test';

test.describe('Exam Editing Flow - Global Save Only', () => {
  test('should navigate to /problem/:id and load ExamPage', async ({ page }) => {
    // Navigate to exam edit page
    await page.goto('http://localhost:5173/problem/1');

    // Verify ExamPage loads (check for exam title or form elements)
    await expect(page.locator('h1')).toContainText('試験編集'); // Assuming page title

    // Verify form elements are present
    await expect(page.locator('input[placeholder*="試験名"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="説明"]')).toBeVisible();
  });

  test('should add and remove questions using global form', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('試験編集');

    // Count initial questions
    const initialQuestionCount = await page.locator('[data-testid="question-item"]').count();

    // Click add question button
    await page.click('button:has-text("大問を追加")');

    // Verify question count increased
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount + 1);

    // Click delete button on the new question
    const deleteButtons = page.locator('button:has-text("削除")');
    await deleteButtons.last().click();

    // Verify question count returned to initial
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(initialQuestionCount);
  });

  test('should add and remove subquestions', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    await expect(page.locator('h1')).toContainText('試験編集');

    // Count initial subquestions in first question
    const initialSubQuestionCount = await page.locator('[data-testid="subquestion-item"]').count();

    // Click add subquestion button
    await page.click('button:has-text("小問を追加")');

    // Verify subquestion count increased
    await expect(page.locator('[data-testid="subquestion-item"]')).toHaveCount(initialSubQuestionCount + 1);

    // Delete the new subquestion
    const deleteButtons = page.locator('button:has-text("削除")');
    await deleteButtons.last().click();

    // Verify count returned
    await expect(page.locator('[data-testid="subquestion-item"]')).toHaveCount(initialSubQuestionCount);
  });

  test('should change question type and show appropriate editor', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    await expect(page.locator('h1')).toContainText('試験編集');

    // Find question type selector (assuming it's a select or radio buttons)
    const questionTypeSelect = page.locator('select[name*="questionType"]').first();

    // Change to selection type (ID 1)
    await questionTypeSelect.selectOption('1');

    // Verify selection editor appears
    await expect(page.locator('text=選択肢')).toBeVisible();

    // Change to matching type (ID 4)
    await questionTypeSelect.selectOption('4');

    // Verify matching editor appears
    await expect(page.locator('text=マッチング')).toBeVisible();
  });

  test('should save entire exam via TopMenuBar', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    await expect(page.locator('h1')).toContainText('試験編集');

    // Modify exam title
    await page.fill('input[placeholder*="試験名"]', 'Modified Exam Title');

    // Verify TopMenuBar save button is enabled (has unsaved changes)
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeEnabled();

    // Click save (this would trigger the global save)
    await saveButton.click();

    // Verify save success (assuming success message or redirect)
    // This depends on the actual UI implementation
    await expect(page.locator('text=保存しました')).toBeVisible();
  });

  test('should block save when validation fails', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    await expect(page.locator('h1')).toContainText('試験編集');

    // Clear required title field
    await page.fill('input[placeholder*="試験名"]', '');

    // Try to save
    const saveButton = page.locator('button:has-text("保存")');
    await saveButton.click();

    // Verify validation error is shown
    await expect(page.locator('text=必須項目です')).toBeVisible();

    // Verify save was blocked
    await expect(page.locator('text=保存しました')).not.toBeVisible();
  });

  test('TopMenuBar should be opaque and have high z-index', async ({ page }) => {
    await page.goto('http://localhost:5173/problem/1');

    const navbar = page.locator('nav').first();

    const backgroundColor = await navbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(255, 255, 255)'); // bg-white

    const zIndex = await navbar.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBe(10);
  });
});
