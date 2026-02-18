import type { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly logoutButton: Locator
  readonly createButton: Locator
  readonly promptCards: Locator
  readonly emptyMessage: Locator
  readonly exportButton: Locator
  readonly importButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'PromptVault' })
    this.logoutButton = page.getByRole('button', { name: 'ログアウト' })
    this.createButton = page.locator('[title="新しいプロンプトを作成"]')
    this.promptCards = page.locator('.grid > div')
    this.emptyMessage = page.getByText('プロンプトがありません')
    this.exportButton = page.getByRole('button', { name: 'エクスポート' })
    this.importButton = page.getByRole('button', { name: 'インポート' })
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async logout() {
    await this.logoutButton.click()
  }

  async openCreateForm() {
    await this.createButton.click()
  }

  async fillPromptForm(data: {
    title: string
    content: string
    description?: string
    category?: string
  }) {
    await this.page.locator('#title').fill(data.title)
    await this.page.locator('#content').fill(data.content)
    if (data.description) {
      await this.page.locator('#description').fill(data.description)
    }
    if (data.category) {
      await this.page.locator('#category').selectOption(data.category)
    }
  }

  async submitPromptForm() {
    await this.page.getByRole('button', { name: '作成する' }).click()
  }
}
