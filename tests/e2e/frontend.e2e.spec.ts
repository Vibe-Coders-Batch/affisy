import { test, expect } from '@playwright/test'

test('ShoppeCove homepage and journal navigation', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/ShoppeCove/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good finds.')
  await page.getByRole('link', { name: 'Explore the journal' }).click()
  await expect(page.getByRole('navigation', { name: 'Article categories' })).toBeVisible()
  await page.getByRole('link', { name: 'Sleep & comfort', exact: true }).last().click()
  await expect(page).toHaveURL(/category=sleep-comfort/)
})
