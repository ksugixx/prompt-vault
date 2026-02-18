import { describe, it, expect, vi, beforeEach } from 'vitest';
import { googleAuth } from './index';

// モック設定
vi.mock('../../utils/google', () => ({
  verifyGoogleIdToken: vi.fn(),
}));

vi.mock('../../utils/mongodb', () => ({
  getUsersCollection: vi.fn(),
}));

vi.mock('../../utils/auth', () => ({
  generateToken: vi.fn().mockReturnValue('mock-jwt-token'),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid'),
}));

import { verifyGoogleIdToken } from '../../utils/google';
import { getUsersCollection } from '../../utils/mongodb';

const mockCollection = {
  findOne: vi.fn(),
  countDocuments: vi.fn(),
  insertOne: vi.fn(),
};

const createMockRequest = (body: any) =>
  ({
    json: () => Promise.resolve(body),
  }) as any;

const mockContext = {
  log: vi.fn(),
  error: vi.fn(),
} as any;

describe('GoogleAuth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getUsersCollection as any).mockResolvedValue(mockCollection);
  });

  it('idTokenが未送信の場合は400を返す', async () => {
    const req = createMockRequest({});
    const result = await googleAuth(req, mockContext);
    expect(result.status).toBe(400);
  });

  it('不正なGoogleトークンの場合は401を返す', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue(null);

    const req = createMockRequest({ idToken: 'invalid-token' });
    const result = await googleAuth(req, mockContext);
    expect(result.status).toBe(401);
  });

  it('既存ユーザーの場合はJWTを返す (isNewUser: false)', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({
      googleId: 'google-123',
      email: 'test@example.com',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/photo.jpg',
    });

    mockCollection.findOne.mockResolvedValue({
      id: 'user-123',
      googleId: 'google-123',
      email: 'test@example.com',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/photo.jpg',
    });

    const req = createMockRequest({ idToken: 'valid-token' });
    const result = await googleAuth(req, mockContext);

    expect(result.status).toBe(200);
    expect(result.jsonBody).toMatchObject({
      token: 'mock-jwt-token',
      userId: 'user-123',
      displayName: 'Test User',
      isNewUser: false,
    });
  });

  it('新規ユーザー (MAX_USERS未満) の場合は登録してJWTを返す', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({
      googleId: 'google-new',
      email: 'new@example.com',
      displayName: 'New User',
      pictureUrl: undefined,
    });

    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.countDocuments.mockResolvedValue(1);
    mockCollection.insertOne.mockResolvedValue({});

    const req = createMockRequest({ idToken: 'valid-token' });
    const result = await googleAuth(req, mockContext);

    expect(result.status).toBe(200);
    expect(result.jsonBody).toMatchObject({
      token: 'mock-jwt-token',
      userId: 'mock-uuid',
      displayName: 'New User',
      isNewUser: true,
    });
    expect(mockCollection.insertOne).toHaveBeenCalledOnce();
  });

  it('ユーザー上限に達している場合は403を返す', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({
      googleId: 'google-new',
      email: 'new@example.com',
      displayName: 'New User',
    });

    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.countDocuments.mockResolvedValue(3); // MAX_USERS default is 3

    const req = createMockRequest({ idToken: 'valid-token' });
    const result = await googleAuth(req, mockContext);

    expect(result.status).toBe(403);
    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });
});
