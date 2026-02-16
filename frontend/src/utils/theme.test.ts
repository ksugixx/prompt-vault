import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredTheme, setStoredTheme, applyTheme, getEffectiveTheme } from './theme';

describe('theme.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('getStoredTheme', () => {
    it('デフォルトでsystemを返す', () => {
      expect(getStoredTheme()).toBe('system');
    });

    it('保存されたテーマを返す', () => {
      localStorage.setItem('theme', 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('無効な値の場合systemを返す', () => {
      localStorage.setItem('theme', 'invalid');
      expect(getStoredTheme()).toBe('system');
    });
  });

  describe('setStoredTheme', () => {
    it('テーマをlocalStorageに保存する', () => {
      setStoredTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('darkテーマでdarkクラスを追加する', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('lightテーマでdarkクラスを削除する', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('getEffectiveTheme', () => {
    it('light/darkはそのまま返す', () => {
      expect(getEffectiveTheme('light')).toBe('light');
      expect(getEffectiveTheme('dark')).toBe('dark');
    });

    it('systemの場合はシステム設定に従う', () => {
      // setup.tsでmatchMediaはmatches:falseにモック済み → light
      expect(getEffectiveTheme('system')).toBe('light');
    });
  });
});
