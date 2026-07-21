import { test, expect } from '@playwright/test';

test.describe('AeroGym 2.0 E2E Flow', () => {
  test('renders homepage and navigation elements', async ({ page }) => {
    await page.goto('/Aerogym/');
    
    // Validar título y elementos principales de navegación
    await expect(page).toHaveTitle(/AeroGym/i);
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('allows navigating between main views', async ({ page }) => {
    await page.goto('/Aerogym/');

    // Click en la pestaña Coach
    const coachBtn = page.getByRole('button', { name: /coach/i });
    if (await coachBtn.isVisible()) {
      await coachBtn.click();
      await expect(page.getByText(/Soy Aero/i)).toBeVisible();
    }
  });
});
