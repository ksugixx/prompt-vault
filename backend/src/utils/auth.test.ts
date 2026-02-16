import { describe, it, expect } from 'vitest';
import {
  generateToken,
  verifyToken,
  extractTokenFromRequest,
  validateUsername,
} from './auth';

describe('auth.ts', () => {
  describe('generateToken / verifyToken', () => {
    it('有効なトークンを生成し検証できる', () => {
      const token = generateToken('user-123', 'testuser');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe('user-123');
      expect(payload!.username).toBe('testuser');
    });

    it('不正なトークンは検証失敗する', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('改竄されたトークンは検証失敗する', () => {
      const token = generateToken('user-123', 'testuser');
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

  describe('validateUsername', () => {
    it('有効なユーザー名を受け入れる', () => {
      expect(validateUsername('abc').valid).toBe(true);
      expect(validateUsername('user_123').valid).toBe(true);
      expect(validateUsername('A'.repeat(20)).valid).toBe(true);
    });

    it('空のユーザー名を拒否する', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('短すぎるユーザー名を拒否する', () => {
      expect(validateUsername('ab').valid).toBe(false);
    });

    it('長すぎるユーザー名を拒否する', () => {
      expect(validateUsername('A'.repeat(21)).valid).toBe(false);
    });

    it('不正な文字を含むユーザー名を拒否する', () => {
      expect(validateUsername('user name').valid).toBe(false);
      expect(validateUsername('user@name').valid).toBe(false);
    });
  });
});
