import { test, expect } from '@playwright/test'

test('ShoppeCove homepage and journal navigation', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/ShoppeCove/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Follow your curiosity.')
  await page.getByRole('link', { name: 'Explore the journal' }).click()
  const topics = page.getByRole('navigation', { name: 'Article topics' })
  await expect(topics).toBeVisible()
  await topics.getByRole('link', { name: 'Learning & hobbies', exact: true }).click()
  await expect(page).toHaveURL(/topic=learning-hobbies/)
  await expect(topics.getByRole('link', { name: 'Learning & hobbies', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(
    page.getByRole('heading', { level: 3 }).filter({ hasText: /Pianoforall/i }),
  ).toBeVisible()
})
