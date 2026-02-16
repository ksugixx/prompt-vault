import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from './password';

describe('password.ts', () => {
  describe('hashPassword / verifyPassword', () => {
    it('パスワードをハッシュ化し検証できる', async () => {
      const hash = await hashPassword('TestPassword123');
      expect(hash).toBeTruthy();
      expect(hash).not.toBe('TestPassword123');

      const isValid = await verifyPassword('TestPassword123', hash);
      expect(isValid).toBe(true);
    });

    it('間違ったパスワードは検証失敗する', async () => {
      const hash = await hashPassword('CorrectPassword1');
      const isValid = await verifyPassword('WrongPassword2', hash);
      expect(isValid).toBe(false);
    });

    it('同じパスワードでも異なるハッシュが生成される', async () => {
      const hash1 = await hashPassword('SamePassword1');
      const hash2 = await hashPassword('SamePassword1');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validatePasswordStrength', () => {
    it('有効なパスワードを受け入れる', () => {
      expect(validatePasswordStrength('Password1').valid).toBe(true);
      expect(validatePasswordStrength('abcdefg1').valid).toBe(true);
      expect(validatePasswordStrength('1234567a').valid).toBe(true);
    });

    it('空のパスワードを拒否する', () => {
      expect(validatePasswordStrength('').valid).toBe(false);
    });

    it('8文字未満のパスワードを拒否する', () => {
      expect(validatePasswordStrength('Pass1').valid).toBe(false);
      expect(validatePasswordStrength('abcdef1').valid).toBe(false);
    });

    it('英字のみのパスワードを拒否する', () => {
      expect(validatePasswordStrength('abcdefgh').valid).toBe(false);
    });

    it('数字のみのパスワードを拒否する', () => {
      expect(validatePasswordStrength('12345678').valid).toBe(false);
    });
  });
});
