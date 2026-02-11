/**
 * パスワードハッシュ化・検証ユーティリティ
 */

import bcrypt from 'bcryptjs';

// ソルトラウンド数（REQUIREMENTS.mdに従い10）
const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化
 * @param password 平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * パスワードを検証
 * @param password 平文パスワード
 * @param hash ハッシュ化されたパスワード
 * @returns パスワードが一致する場合true
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * パスワードの強度を検証
 * 最小8文字、英数字を含む
 * @param password パスワード
 * @returns 検証結果とエラーメッセージ
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  // 英字と数字を含むかチェック（オプション：より厳格な要件が必要な場合）
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain both letters and numbers',
    };
  }

  return { valid: true };
}
