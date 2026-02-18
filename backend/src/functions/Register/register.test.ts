import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register } from './index';

// モック設定
const mockCollection = {
  countDocuments: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
};

vi.mock('../../utils/mongodb', () => ({
  getUsersCollection: vi.fn(() => Promise.resolve(mockCollection)),
}));

vi.mock('../../utils/password', () => ({
  hashPassword: vi.fn(() => Promise.resolve('hashed_password')),
  validatePasswordStrength: vi.fn(() => ({ valid: true })),
}));

vi.mock('../../utils/auth', () => ({
  validateUsername: vi.fn(() => ({ valid: true })),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}));

vi.mock('@azure/functions', () => ({
  app: { http: vi.fn() },
}));

function createMockRequest(body: Record<string, string>) {
  return {
    json: () => Promise.resolve(body),
  } as any;
}

function createMockContext() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  } as any;
}

describe('Register API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MAX_USERS;
  });

  it('上限未満の場合は登録成功する', async () => {
    mockCollection.countDocuments.mockResolvedValue(2);
    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.insertOne.mockResolvedValue({});
    process.env.MAX_USERS = '3';

    const req = createMockRequest({ username: 'testuser', password: 'Password1' });
    const result = await register(req, createMockContext());

    expect(result.status).toBe(201);
    expect(result.jsonBody).toEqual({
      message: 'User registered successfully',
      userId: 'test-uuid-1234',
    });
  });

  it('上限に達している場合は403エラーを返す', async () => {
    mockCollection.countDocuments.mockResolvedValue(3);
    process.env.MAX_USERS = '3';

    const req = createMockRequest({ username: 'testuser', password: 'Password1' });
    const result = await register(req, createMockContext());

    expect(result.status).toBe(403);
    expect(result.jsonBody).toEqual({ error: 'User registration limit reached' });
    expect(mockCollection.findOne).not.toHaveBeenCalled();
    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });

  it('MAX_USERS未設定時はデフォルト値3が適用される', async () => {
    mockCollection.countDocuments.mockResolvedValue(3);

    const req = createMockRequest({ username: 'testuser', password: 'Password1' });
    const result = await register(req, createMockContext());

    expect(result.status).toBe(403);
    expect(result.jsonBody).toEqual({ error: 'User registration limit reached' });
  });

  it('上限を超えている場合も403エラーを返す', async () => {
    mockCollection.countDocuments.mockResolvedValue(5);
    process.env.MAX_USERS = '3';

    const req = createMockRequest({ username: 'testuser', password: 'Password1' });
    const result = await register(req, createMockContext());

    expect(result.status).toBe(403);
  });
});
