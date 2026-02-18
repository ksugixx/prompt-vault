import { describe, it, expect } from 'vitest';
import {
  generateToken,
  verifyToken,
  extractTokenFromRequest,
} from './auth';

describe('auth.ts', () => {
  describe('generateToken / verifyToken', () => {
    it('有効なトークンを生成し検証できる', () => {
      const token = generateToken('user-123', 'Test User');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe('user-123');
      expect(payload!.displayName).toBe('Test User');
    });

    it('不正なトークンは検証失敗する', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('改竄されたトークンは検証失敗する', () => {
      const token = generateToken('user-123', 'Test User');
      const tamperedToken = token + 'x';
      const payload = verifyToken(tamperedToken);
      expect(payload).toBeNull();
    });
  });

  describe('extractTokenFromRequest', () => {
    const createMockRequest = (headers: Record<string, string>) =>
      ({
        headers: {
          get: (name: string) => headers[name.toLowerCase()] || null,
        },
      }) as any;

    it('Authorization ヘッダーからトークンを抽出できる', () => {
      const req = createMockRequest({ authorization: 'Bearer mytoken' });
      expect(extractTokenFromRequest(req)).toBe('mytoken');
    });

    it('X-Authorization ヘッダーからもトークンを抽出できる', () => {
      const req = createMockRequest({ 'x-authorization': 'Bearer mytoken' });
      expect(extractTokenFromRequest(req)).toBe('mytoken');
    });

    it('ヘッダーなしの場合はnullを返す', () => {
      const req = createMockRequest({});
      expect(extractTokenFromRequest(req)).toBeNull();
    });

    it('Bearer形式でない場合はnullを返す', () => {
      const req = createMockRequest({ authorization: 'Basic abc123' });
      expect(extractTokenFromRequest(req)).toBeNull();
    });
  });
});
