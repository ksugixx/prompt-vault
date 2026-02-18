import type { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly heading: Locator
  readonly subHeading: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'PromptVault' })
    this.subHeading = page.getByText('Googleアカウントでログイン')
    this.errorMessage = page.locator('[class*="bg-red"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  /**
   * localStorageに直接トークンを設定してログイン状態にする
   * （Google Sign-InはE2Eテストで直接操作できないため）
   */
  async loginViaLocalStorage(authData: {
    token: string
    userId: string
    displayName: string
    email: string
    pictureUrl?: string
  }) {
    await this.page.evaluate((data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('displayName', data.displayName)
      localStorage.setItem('email', data.email)
      if (data.pictureUrl) {
        localStorage.setItem('pictureUrl', data.pictureUrl)
      }
    }, authData)
    await this.page.goto('/dashboard')
  }
}
