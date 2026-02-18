import { test, expect } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/dashboard.page'
import { MOCK_PROMPTS } from '../helpers/mock-data'

test.describe('プロンプトCRUD操作', () => {
  test('ダッシュボードにプロンプト一覧が表示される', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    await expect(dashboard.heading).toBeVisible()
    // モックデータのプロンプトが表示されることを確認
    await expect(page.getByText(MOCK_PROMPTS[0].title)).toBeVisible()
    await expect(page.getByText(MOCK_PROMPTS[1].title)).toBeVisible()
  })

  test('表示名がヘッダーに表示される', async ({ authenticatedPage: page }) => {
    await expect(page.getByText('Test User')).toBeVisible()
  })

  test('新しいプロンプトを作成できる', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    // FABで作成フォームを開く
    await dashboard.openCreateForm()

    // フォームモーダルが表示される
    await expect(page.getByText('新しいプロンプト')).toBeVisible()

    // フォームに入力
    await dashboard.fillPromptForm({
      title: 'E2Eテストプロンプト',
      content: 'これはE2Eテストで作成したプロンプトです',
      category: 'コーディング',
    })

    // 送信
    await dashboard.submitPromptForm()

    // フォームモーダルが閉じることを確認
    await expect(page.getByText('新しいプロンプト')).not.toBeVisible()
  })

  test('プロンプトカードにカテゴリとタグが表示される', async ({ authenticatedPage: page }) => {
    // カテゴリバッジ（button要素）
    await expect(page.locator('.grid button', { hasText: 'コーディング' }).first()).toBeVisible()
    // タグバッジ（button要素）
    await expect(page.locator('.grid button', { hasText: 'テスト' }).first()).toBeVisible()
  })

  test('ヘッダーのボタンが表示される', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    await expect(dashboard.exportButton).toBeVisible()
    await expect(dashboard.importButton).toBeVisible()
    await expect(dashboard.logoutButton).toBeVisible()
  })
})
