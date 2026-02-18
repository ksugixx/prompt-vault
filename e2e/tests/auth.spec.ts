import { test, expect } from '../fixtures/api-mock.fixture'
import { LoginPage } from '../pages/login.page'
import { MOCK_GOOGLE_AUTH_RESPONSE } from '../helpers/mock-data'

test.describe('認証フロー', () => {
  test('ログインページが正しく表示される', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.heading).toBeVisible()
    await expect(loginPage.subHeading).toBeVisible()
  })

  test('認証済み状態でダッシュボードにアクセスできる', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginViaLocalStorage(MOCK_GOOGLE_AUTH_RESPONSE)

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('ログアウトするとログインページに戻る', async ({ mockApi: page }) => {
    // まず認証済み状態にする
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginViaLocalStorage(MOCK_GOOGLE_AUTH_RESPONSE)
    await expect(page).toHaveURL(/\/dashboard/)

    // ログアウト
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await expect(page).toHaveURL(/\/login/)

    // localStorageがクリアされていることを確認
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeNull()
  })

  test('未認証状態でダッシュボードにアクセスするとログインページにリダイレクトされる', async ({ mockApi: page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('認証済み状態でlocalStorageにトークンが保存されている', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginViaLocalStorage(MOCK_GOOGLE_AUTH_RESPONSE)

    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBe(MOCK_GOOGLE_AUTH_RESPONSE.token)

    const displayName = await page.evaluate(() => localStorage.getItem('displayName'))
    expect(displayName).toBe(MOCK_GOOGLE_AUTH_RESPONSE.displayName)
  })
})
