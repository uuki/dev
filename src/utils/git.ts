/**
 * Git Utilities (Next.js compatible)
 * 既存のNext.js実装と互換性のあるGit履歴取得ユーティリティ
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import type { PostRevision } from '@/types/post';

interface GetFileRevisionProps {
  slug: string;
  limit?: number;
}

/**
 * ファイルのGit履歴を取得（Next.js getFileRevision互換）
 *
 * @param slug - ファイルパス（例: "blog/my-post.mdx"）
 * @param limit - 取得する履歴の最大数（0 = 無制限）
 * @returns PostRevision配列
 *
 * @example
 * const history = getFileRevision({ slug: 'blog/my-post.mdx', limit: 10 });
 */
export function getFileRevision({
  slug,
  limit = 0,
}: GetFileRevisionProps): PostRevision[] {
  // .DS_Storeファイルをスキップ
  if (/\.DS_Store$/.test(slug)) {
    return [];
  }

  // ファイルパスを構築
  const basePath = `src/data/${slug}`;
  let filePath: string;

  if (existsSync(basePath)) {
    filePath = basePath;
  } else if (existsSync(`${basePath}.mdx`)) {
    filePath = `${basePath}.mdx`;
  } else if (existsSync(`${basePath}.md`)) {
    filePath = `${basePath}.md`;
  } else {
    // ファイルが存在しない、またはGitリポジトリでない場合
    return [];
  }

  if (!existsSync('.git')) {
    return [];
  }

  try {
    /**
     * Git logコマンド（Next.js実装と同じフォーマット）
     * @doc https://git-scm.com/docs/pretty-formats#_pretty_formats
     *
     * フォーマット: [hash,authorDate]
     * %h = 短縮ハッシュ
     * %ad = author date
     */
    const limitFlag = limit > 0 ? `-${limit}` : '';
    const command = `git log ${limitFlag} --pretty=format:"[%h,%ad]" --no-merges -- "${filePath}"`;

    const stdout = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024, // 1MB
    }).trim();

    if (!stdout) {
      return [];
    }

    // Next.jsと同じパース処理
    const parseRevs = JSON.parse(
      `[${stdout.replace(/\[(.*),(.*)\]/g, '["$1", "$2"]').replace(/\r\n|\n|\r/g, ',')}]`
    ).filter(Boolean);

    const formatRevs = parseRevs.reduce(
      (acc: PostRevision[], cur: string[]) => {
        acc.push({
          hash: cur[0],
          authorDate: cur[1],
        });
        return acc;
      },
      []
    );

    return formatRevs;
  } catch (error) {
    console.warn(`Failed to get git history for ${slug}:`, error);
    return [];
  }
}

/**
 * GitHub compare URLを生成
 *
 * @param repoUrl - リポジトリURL（例: "https://github.com/user/repo"）
 * @param fromHash - 比較元のハッシュ
 * @param toHash - 比較先のハッシュ
 * @returns compare URL
 */
export function getCompareUrl(
  repoUrl: string,
  fromHash: string,
  toHash: string
): string {
  const baseUrl = repoUrl.replace(/\/$/, '');

  // GitHub
  if (baseUrl.includes('github.com')) {
    return `${baseUrl}/compare/${fromHash}..${toHash}`;
  }

  // GitLab
  if (baseUrl.includes('gitlab.com')) {
    return `${baseUrl}/-/compare/${fromHash}...${toHash}`;
  }

  // その他（GitHubフォーマット）
  return `${baseUrl}/compare/${fromHash}..${toHash}`;
}
