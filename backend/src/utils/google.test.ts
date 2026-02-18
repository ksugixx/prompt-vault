import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVerifyIdToken = vi.hoisted(() => vi.fn());

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = mockVerifyIdToken;
  },
}));

import { verifyGoogleIdToken } from './google';

describe('google.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyGoogleIdToken', () => {
    it('正常なIDトークンでユーザー情報を返す', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-id-123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
        }),
      });

      const result = await verifyGoogleIdToken('valid-token');
      expect(result).toEqual({
        googleId: 'google-id-123',
        email: 'test@example.com',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/photo.jpg',
      });
    });

    it('nameがない場合はemailをdisplayNameとして使用する', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-id-123',
          email: 'test@example.com',
          name: undefined,
          picture: undefined,
        }),
      });

      const result = await verifyGoogleIdToken('valid-token');
      expect(result).not.toBeNull();
      expect(result!.displayName).toBe('test@example.com');
      expect(result!.pictureUrl).toBeUndefined();
    });

    it('不正なトークンでnullを返す', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const result = await verifyGoogleIdToken('invalid-token');
      expect(result).toBeNull();
    });

    it('payloadにsubがない場合はnullを返す', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: undefined,
          email: 'test@example.com',
        }),
      });

      const result = await verifyGoogleIdToken('token-without-sub');
      expect(result).toBeNull();
    });

    it('payloadにemailがない場合はnullを返す', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-id-123',
          email: undefined,
        }),
      });

      const result = await verifyGoogleIdToken('token-without-email');
      expect(result).toBeNull();
    });

    it('payloadがnullの場合はnullを返す', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      const result = await verifyGoogleIdToken('token-null-payload');
      expect(result).toBeNull();
    });
  });
});
