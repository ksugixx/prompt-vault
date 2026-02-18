import { test, expect } from '../fixtures/api-mock.fixture'
import { LoginPage } from '../pages/login.page'
import { RegisterPage } from '../pages/register.page'
import { TEST_USER, MOCK_LOGIN_RESPONSE } from '../helpers/mock-data'

test.describe('認証フロー', () => {
  test('ログインページが正しく表示される', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.heading).toBeVisible()
    await expect(loginPage.usernameInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
    await expect(loginPage.registerLink).toBeVisible()
  })

  test('正しい認証情報でログインできる', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.username, TEST_USER.password)

    await page.waitForURL('**/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('新規登録ページに遷移できる', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.registerLink.click()

    await expect(page).toHaveURL(/\/register/)
  })

  test('新規登録後にログインページにリダイレクトされる', async ({ mockApi: page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.goto()
    await registerPage.register(TEST_USER.username, TEST_USER.password, TEST_USER.password)

    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login/)
  })

  test('短すぎるユーザー名で登録バリデーションエラーが表示される', async ({ mockApi: page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.goto()
    await registerPage.register('ab', TEST_USER.password, TEST_USER.password)

    await expect(registerPage.errorMessage).toBeVisible()
  })

  test('パスワード不一致で登録バリデーションエラーが表示される', async ({ mockApi: page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.goto()
    await registerPage.register(TEST_USER.username, TEST_USER.password, 'DifferentPass123')

    await expect(registerPage.errorMessage).toBeVisible()
  })

  test('ログアウトするとログインページに戻る', async ({ mockApi: page }) => {
    // まずログインする
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.username, TEST_USER.password)
    await page.waitForURL('**/dashboard')

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

  test('ログイン後にlocalStorageにトークンが保存される', async ({ mockApi: page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.username, TEST_USER.password)
    await page.waitForURL('**/dashboard')

    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBe(MOCK_LOGIN_RESPONSE.token)
  })
})
