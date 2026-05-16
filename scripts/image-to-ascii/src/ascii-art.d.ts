declare module "ascii-art" {
  export type ImageOptions = {
    filepath: string;
    width?: number;
    alphabet?: string;
  };

  const asciiArt: {
    image(options: ImageOptions): Promise<string>;
  };

  export default asciiArt;
}
