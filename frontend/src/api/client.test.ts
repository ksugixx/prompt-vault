import { describe, it, expect, beforeEach } from 'vitest';
import { logout, getAuthState } from './client';

describe('client.ts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('logout', () => {
    it('localStorageからトークン・ユーザー情報を削除する', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', 'user-123');
      localStorage.setItem('username', 'testuser');

      logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
    });
  });

  describe('getAuthState', () => {
    it('認証済みの場合、正しい状態を返す', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', 'user-123');
      localStorage.setItem('username', 'testuser');

      const state = getAuthState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('test-token');
      expect(state.userId).toBe('user-123');
      expect(state.username).toBe('testuser');
    });

    it('未認証の場合、isAuthenticatedがfalseを返す', () => {
      const state = getAuthState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
    });
  });
});
