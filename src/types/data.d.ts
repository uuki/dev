declare module '@/data/meta.yml' {
  interface MetaData {
    title: string;
    description: string;
    'og:title': string;
    'og:description': string;
    'og:image': string;
    'twitter:title': string;
    'twitter:description': string;
  }
  const value: MetaData;
  export default value;
}
