import { test, expect } from '@playwright/test';

test.describe('Problem Creation Flow', () => {
  test('should go through the structural analysis phase and hide problem content', async ({ page }) => {
    // 1. Home page
    await page.goto('http://localhost:5173/');
    
    // 2. Click Upload
    await page.click('button:has-text("問題をアップロード")');
    
    // 3. Upload file (Mocking file choice is tricky in simple scripts, usually use input.setInputFiles)
    // For this test plan, we assume the UI elements are interactable.
    
    // 4. Check "Confirm Structure"
    await page.check('label:has-text("問題構造を確認")');
    
    // 5. Start Generation
    await page.click('button:has-text("問題生成を開始する")');
    
    // 6. Verify Analysis Phase
    await expect(page.locator('h2')).toContainText('構造の確認と編集');
    
    // 7. Verify structural elements are visible but content is NOT
    // QuestionBlock should have metadata but not QuestionForm
    await expect(page.locator('text=難易度')).toBeVisible();
    await expect(page.locator('text=キーワード')).toBeVisible();
    
    // QuestionForm textareas should NOT exist in AnalysisPhase due to StructureAnalysisEditor
    const textareaCount = await page.locator('textarea').count();
    expect(textareaCount).toBe(0); 
    
    // 8. Proceed to Generation
    await page.click('button:has-text("次へ進む")');
    
    // 9. Verify Generation Phase (Step 3)
    await expect(page.locator('h2')).toContainText('問題生成中');
  });

  test('TopMenuBar should be opaque and have high z-index', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const navbar = page.locator('nav').first();
    
    const backgroundColor = await navbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(255, 255, 255)'); // bg-white
    
    const zIndex = await navbar.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBe(10);
  });
});
