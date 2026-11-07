import { expect, test } from '@playwright/test';

test('loads the home page with the catalog', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/New York/i);
  await expect(page.locator('.product-node').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('search narrows the results and is mirrored in the URL', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.product-node');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  const first = (await cards.first().locator('.product-name').textContent())?.trim() ?? '';

  await page.locator('#catalog-product-search').fill(first.split(/\s+/)[0]);
  await expect(page).toHaveURL(/[?&]q=/);
  await expect(cards.first()).toContainText(first.split(/\s+/)[0], { ignoreCase: true });
  expect(await cards.count()).toBeLessThanOrEqual(before);
});

test('sorting is reflected in the URL and survives a reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.product-node').first()).toBeVisible();
  const sort = page.getByLabel('Ordenar por');
  const option = await sort.locator('option').nth(1).getAttribute('value');
  await sort.selectOption(option!);
  await expect(page).toHaveURL(/sort=/);
  await page.reload();
  await expect(page.getByLabel('Ordenar por')).toHaveValue(option!);
});

test('opens a product and offers a WhatsApp link with the product in the message', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('.product-node').first();
  await card.scrollIntoViewIfNeeded();
  const name = (await card.locator('.product-name').textContent())?.trim() ?? '';
  await card.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const link = dialog.locator('a.lightbox-whatsapp').first();
  const href = (await link.getAttribute('href')) ?? '';
  expect(href).toMatch(/^https:\/\/wa\.me/);
  expect(decodeURIComponent(href)).toContain(name);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
