export type ArticleActivity = {
  kind: 'article';
  id: string;
  date: string;
  title: string;
  url: string | null;
  slug: string | null;
  tags: string[];
};

export type ReleaseActivity = {
  kind: 'release';
  id: string;
  date: string;
  title: string;
  url: string;
  version: string;
  repo: string;
  prerelease: boolean;
};

export type ContributionActivity = {
  kind: 'contribution';
  date: string;
  year: number;
  total: number;
};

export type Activity = ArticleActivity | ReleaseActivity | ContributionActivity;
