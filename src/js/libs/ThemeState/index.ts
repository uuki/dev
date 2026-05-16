import { ok, err, type Result } from '../result';
import type { Theme, ThemeMap, ThemeStateOptions, ThemeStateHandle } from './types';

export type { Theme, ThemeMap, ThemeStateOptions, ThemeStateHandle };


const DEFAULT_STORAGE_KEY = 'theme';

const DEFAULT_THEME_MAP: ThemeMap = {
  light: 'light',
  dark: 'dark',
};

const resolveTheme = (key: string, themeMap: ThemeMap): Result<Theme, string> => {
  const theme = themeMap[key];
  if (theme === undefined) {
    return err(
      `Invalid theme key: "${key}". Allowed: ${Object.keys(themeMap).join(', ')}`
    );
  }
  return ok(theme);
};

const applyToDOM = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

const saveToStorage = (key: string, theme: Theme): Result<void, string> => {
  try {
    localStorage.setItem(key, theme);
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'localStorage write failed');
  }
};

const readFromStorage = (
  key: string,
  themeMap: ThemeMap
): Result<Theme, string> => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return err('No theme value in storage');
    // ストレージから読んだ生の文字列をキーとして再検証
    return resolveTheme(raw, themeMap);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'localStorage read failed');
  }
};

const checkEnvironment = (): Result<void, string> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return err('ThemeState requires a browser environment');
  }
  try {
    const probe = '__theme_probe';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch {
    return err('localStorage is not available (private mode?)');
  }
  return ok(undefined);
};

export function createThemeState(
  options: ThemeStateOptions = {}
): Result<ThemeStateHandle, string> {
  const envResult = checkEnvironment();
  if (envResult._tag === 'Err') return envResult;

  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const themeMap: ThemeMap = { ...DEFAULT_THEME_MAP, ...options.themeMap };

  const setTheme = (key: string): Result<Theme, string> => {
    const themeResult = resolveTheme(key, themeMap);
    if (themeResult._tag === 'Err') return themeResult;
    const theme = themeResult.value;

    const saveResult = saveToStorage(storageKey, theme);
    if (saveResult._tag === 'Err') return saveResult;

    applyToDOM(theme);

    options.onChange?.(theme);

    return ok(theme);
  };

  const getTheme = (): Result<Theme, string> =>
    readFromStorage(storageKey, themeMap);

  const restore = (): Result<Theme, string> => {
    const themeResult = getTheme();
    if (themeResult._tag === 'Err') return themeResult;
    applyToDOM(themeResult.value);
    options.onChange?.(themeResult.value);
    return themeResult;
  };

  return ok({
    setTheme,
    getTheme,
    restore,
    destroy() {},
  });
}
