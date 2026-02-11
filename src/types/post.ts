/**
 * Post Revision Type (Next.js compatible)
 * Git履歴の単一コミット情報
 */
export interface PostRevision {
  hash: string;        // 短縮コミットハッシュ（例: "abc1234"）
  authorDate: string;  // コミット日付（author date）
}

/**
 * Git History Config
 */
export interface GitConfig {
  enabled: boolean;
  repoUrl?: string;  // GitHub/GitLab repository URL
  showCompareLinks?: boolean;
}
