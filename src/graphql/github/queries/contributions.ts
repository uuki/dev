import { graphql } from '../tada';

export const contributionsQuery = graphql(`
  query GetYearlyContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`);

// Explicit result type — superseded by schema inference once graphql-env.d.ts is generated.
export type ContributionsVars = {
  login: string;
  from: string;
  to: string;
};

export type ContributionsData = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
      };
    };
  } | null;
};
