export const TEST_USER = {
  displayName: 'Test User',
  email: 'test@example.com',
}

export const MOCK_GOOGLE_AUTH_RESPONSE = {
  token: 'mock-jwt-token-for-testing',
  userId: 'user-001',
  displayName: TEST_USER.displayName,
  email: TEST_USER.email,
  pictureUrl: 'https://example.com/photo.jpg',
  isNewUser: false,
}

export const MOCK_PROMPTS = [
  {
    id: 'prompt-001',
    userId: 'user-001',
    title: 'テスト用プロンプト1',
    content: 'これはテスト用のプロンプト内容です',
    description: 'テスト説明文',
    category: 'コーディング',
    tags: ['テスト', 'サンプル'],
    aiTool: 'Claude',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    isPinned: false,
  },
  {
    id: 'prompt-002',
    userId: 'user-001',
    title: 'ピン留めプロンプト',
    content: 'ピン留めされたプロンプトの内容',
    description: '',
    category: 'ライティング',
    tags: ['重要'],
    aiTool: '',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    isPinned: true,
  },
]

export const MOCK_CREATE_PROMPT_RESPONSE = {
  id: 'prompt-003',
  userId: 'user-001',
  title: '新しいプロンプト',
  content: '新しいプロンプトの内容',
  description: '',
  category: 'コーディング',
  tags: [],
  aiTool: '',
  createdAt: '2026-02-18T10:00:00Z',
  updatedAt: '2026-02-18T10:00:00Z',
  isPinned: false,
}
