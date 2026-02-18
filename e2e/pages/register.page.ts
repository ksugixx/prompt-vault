import type { Page, Locator } from '@playwright/test'

export class RegisterPage {
  readonly page: Page
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    this.page = page
    this.usernameInput = page.locator('#username')
    this.passwordInput = page.locator('#password')
    this.confirmPasswordInput = page.locator('#confirmPassword')
    this.submitButton = page.getByRole('button', { name: 'アカウント作成' })
    this.errorMessage = page.locator('[class*="bg-red"]')
    this.loginLink = page.getByRole('link', { name: 'ログインへ戻る' })
  }

  async goto() {
    await this.page.goto('/register')
  }

  async register(username: string, password: string, confirmPassword: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(confirmPassword)
    await this.submitButton.click()
  }
}
