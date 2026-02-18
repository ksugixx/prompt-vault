import { test as apiMockTest } from './api-mock.fixture'
import { MOCK_LOGIN_RESPONSE } from '../helpers/mock-data'

export const test = apiMockTest.extend({
  authenticatedPage: async ({ mockApi: page }, use) => {
    // localStorageにトークンを設定して認証済み状態にする
    await page.goto('/login')
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('username', data.username)
    }, MOCK_LOGIN_RESPONSE)
    await page.goto('/dashboard')
    await use(page)
  },
})

export { expect } from '@playwright/test'
