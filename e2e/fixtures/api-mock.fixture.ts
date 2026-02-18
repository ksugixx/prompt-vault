import { test as base, type Page } from '@playwright/test'
import {
  MOCK_LOGIN_RESPONSE,
  MOCK_REGISTER_RESPONSE,
  MOCK_PROMPTS,
  MOCK_CREATE_PROMPT_RESPONSE,
} from '../helpers/mock-data'

type ApiMockFixtures = {
  mockApi: Page
}

export const test = base.extend<ApiMockFixtures>({
  mockApi: async ({ page }, use) => {
    // POST /api/login
    await page.route('**/api/login', async (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_LOGIN_RESPONSE),
        })
      } else {
        await route.continue()
      }
    })

    // POST /api/register
    await page.route('**/api/register', async (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_REGISTER_RESPONSE),
        })
      } else {
        await route.continue()
      }
    })

    // GET/POST /api/prompts
    await page.route('**/api/prompts', async (route) => {
      const request = route.request()
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ prompts: MOCK_PROMPTS }),
        })
      } else if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CREATE_PROMPT_RESPONSE),
        })
      } else {
        await route.continue()
      }
    })

    // PUT/DELETE /api/prompts/:id
    await page.route('**/api/prompts/*', async (route) => {
      const request = route.request()
      if (request.method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: '更新しました' }),
        })
      } else if (request.method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: '削除しました' }),
        })
      } else {
        await route.continue()
      }
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
