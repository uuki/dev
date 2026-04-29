import type { Activity } from '@/types/activity';

const KIND_GROUPS = {
  all:          ['article', 'release', 'contribution'],
  article:      ['article'],
  release:      ['release'],
  contribution: ['contribution'],
  oss:          ['release', 'contribution'],
} as const satisfies Record<string, Activity['kind'][]>;

export type ActivityFilter = keyof typeof KIND_GROUPS;

export function filterActivities(activities: Activity[], filter: ActivityFilter): Activity[] {
  if (filter === 'all') return activities;
  const kinds = KIND_GROUPS[filter] as Activity['kind'][];
  return activities.filter((a) => kinds.includes(a.kind));
}
