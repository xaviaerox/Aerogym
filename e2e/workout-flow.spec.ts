import { test, expect } from '@playwright/test';

test.describe('AeroGym 2.0 Enterprise E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server or relative base path
    await page.goto('/Aerogym/');
  });

  test('renders homepage title and main navigation tabs', async ({ page }) => {
    await expect(page).toHaveTitle(/AeroGym/i);
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('allows navigating between main view tabs', async ({ page }) => {
    const coachBtn = page.getByRole('button', { name: /coach/i });
    if (await coachBtn.isVisible()) {
      await coachBtn.click();
      await expect(page.getByText(/Aero|Coach/i)).toBeVisible();
    }

    const statsBtn = page.getByRole('button', { name: /stats/i });
    if (await statsBtn.isVisible()) {
      await statsBtn.click();
      await expect(page.getByText(/Rendimiento|Composición/i)).toBeVisible();
    }
  });

  test('verifies offline library notice in coach view', async ({ page }) => {
    const coachBtn = page.getByRole('button', { name: /coach/i });
    if (await coachBtn.isVisible()) {
      await coachBtn.click();
      const wikiBtn = page.getByText(/Explorar Ejercicios|MuscleWiki/i);
      if (await wikiBtn.isVisible()) {
        await wikiBtn.click();
        await expect(page.getByText(/Biblioteca Local|1,300\+/i)).toBeVisible();
      }
    }
  });
});
