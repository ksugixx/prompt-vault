export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'theme';

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

export const setStoredTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const applyTheme = (theme: Theme): void => {
  const effective = theme === 'system' ? getSystemTheme() : theme;
  if (effective === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getEffectiveTheme = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? getSystemTheme() : theme;

export const initTheme = (): void => {
  applyTheme(getStoredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system');
    }
  });
};
