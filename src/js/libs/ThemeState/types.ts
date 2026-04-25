import type { Result } from '../result';

// ---------------------------------------------------------------------------
// Theme — ストレージ・DOM に実際に書き込まれる許可済みの値
// この型以外の文字列は絶対に外部へ出ない
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark';

// ---------------------------------------------------------------------------
// ThemeMap — select の option.value (key) → Theme (value) のホワイトリスト
// キーは UI 側が自由に決めてよい。マップに存在しないキーは全て拒否される
// ---------------------------------------------------------------------------

export type ThemeMap = Record<string, Theme>;

// ---------------------------------------------------------------------------
// ThemeStateOptions — createThemeState に渡す設定
// ---------------------------------------------------------------------------

export type ThemeStateOptions = {
  /** localStorage のキー名（デフォルト: 'theme'） */
  storageKey?: string;
  /**
   * option.value → Theme のマッピング。
   * 省略すると { light: 'light', dark: 'dark' } が使われる
   */
  themeMap?: ThemeMap;
  /** テーマが変わるたびに呼ばれるコールバック */
  onChange?: (theme: Theme) => void;
};

// ---------------------------------------------------------------------------
// ThemeStateHandle — createThemeState が返すハンドル
// ---------------------------------------------------------------------------

export type ThemeStateHandle = {
  /**
   * select の change イベントで得た option.value (key) を渡す。
   * ホワイトリスト検証 → localStorage 保存 → data-theme 適用 を一括実行
   */
  setTheme(key: string): Result<Theme, string>;
  /** localStorage から現在の Theme を読み出して返す */
  getTheme(): Result<Theme, string>;
  /**
   * ページロード時に localStorage の値を復元して DOM に適用する。
   * 値がない・不正な場合は Err を返す（呼び出し側がデフォルトを決める）
   */
  restore(): Result<Theme, string>;
  destroy(): void;
};
