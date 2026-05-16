export type ConvertOptions = {
  inputPath: string;
  outputPath: string;
  width?: number;
  alphabet?: string;
};

export const DEFAULT_ALPHABET =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export const MAX_WIDTH = 300;
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_INPUT_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp"
]);
