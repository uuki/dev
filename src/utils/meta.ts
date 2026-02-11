export type Meta = {
  title: string;
  description: string;
  type: 'website' | 'article';
  "og:title": string;
  "og:description": string;
  "og:image": string;
  "twitter:title": string;
  "twitter:description": string;
};

export type MetaProps = {
  meta?: Partial<Meta>;
};

export const createMeta = (props: MetaProps['meta']): Readonly<Meta> => ({
  title: '',
  description: '',
  type: 'website',
  "og:title": '',
  "og:description": '',
  "og:image": '',
  "twitter:title": '',
  "twitter:description": '',
  ...props,
});
