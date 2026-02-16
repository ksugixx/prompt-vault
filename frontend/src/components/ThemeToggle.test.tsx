import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('テーマ切り替えボタンが表示される', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'テーマ切り替え' })).toBeInTheDocument();
  });

  it('デフォルトでライトモードのタイトルが表示される', () => {
    render(<ThemeToggle />);
    expect(screen.getByTitle('ダークモードに切り替え')).toBeInTheDocument();
  });

  it('クリックでダークモードに切り替わる', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'テーマ切り替え' }));

    expect(screen.getByTitle('ライトモードに切り替え')).toBeInTheDocument();
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('ダークモードからライトモードに切り替わる', async () => {
    localStorage.setItem('theme', 'dark');
    const user = userEvent.setup();
    render(<ThemeToggle />);

    expect(screen.getByTitle('ライトモードに切り替え')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'テーマ切り替え' }));

    expect(screen.getByTitle('ダークモードに切り替え')).toBeInTheDocument();
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
