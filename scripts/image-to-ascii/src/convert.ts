// src/convert.ts
import { createRequire } from "node:module";
import {
  lstat,
  mkdir,
  realpath,
  stat,
  writeFile
} from "node:fs/promises";
import { dirname, extname } from "node:path";
import {
  ALLOWED_INPUT_EXTENSIONS,
  DEFAULT_ALPHABET,
  MAX_INPUT_BYTES,
  MAX_WIDTH,
  type ConvertOptions
} from "./types.js";

const isUrlLike = (value: string): boolean => /^[a-z]+:\/\//i.test(value);
const require = createRequire(import.meta.url);

const loadAsciiArt = (): { image(options: {
  filepath: string;
  width?: number;
  alphabet?: string;
}): Promise<string> } => {
  try {
    return require("ascii-art");
  } catch (error) {
    const details =
      error instanceof Error ? ` ${error.message}` : "";

    throw new Error(
      "Failed to load ascii-art runtime. The native canvas dependency is not available or is incompatible with this machine." +
        " Reinstall dependencies with the same package manager used for this project, and if needed rebuild canvas for your current macOS/Node environment." +
        details
    );
  }
};

export const convertImageToAscii = async (
  options: ConvertOptions
): Promise<string> => {
  const {
    inputPath,
    outputPath,
    width = 80,
    alphabet = DEFAULT_ALPHABET
  } = options;

  if (!inputPath || !outputPath) {
    throw new Error("inputPath and outputPath are required");
  }

  if (isUrlLike(inputPath)) {
    throw new Error("remote URLs are not allowed for inputPath");
  }

  if (!Number.isInteger(width) || width < 1 || width > MAX_WIDTH) {
    throw new Error(`width must be an integer between 1 and ${MAX_WIDTH}`);
  }

  const inputExtension = extname(inputPath).toLowerCase();
  if (!ALLOWED_INPUT_EXTENSIONS.has(inputExtension)) {
    throw new Error(`unsupported input file type: ${inputExtension || "(none)"}`);
  }

  if (extname(outputPath).toLowerCase() !== ".txt") {
    throw new Error("outputPath must end with .txt");
  }

  const inputStats = await lstat(inputPath);
  if (!inputStats.isFile()) {
    throw new Error("inputPath must be a regular file");
  }

  if (inputStats.isSymbolicLink()) {
    throw new Error("symbolic links are not allowed for inputPath");
  }

  const resolvedInputPath = await realpath(inputPath);
  const fileStats = await stat(resolvedInputPath);
  if (fileStats.size > MAX_INPUT_BYTES) {
    throw new Error(
      `input file is too large: ${fileStats.size} bytes exceeds ${MAX_INPUT_BYTES}`
    );
  }

  await mkdir(dirname(outputPath), { recursive: true });

  const asciiArt = loadAsciiArt();
  const ascii = await asciiArt.image({
    filepath: resolvedInputPath,
    width,
    alphabet
  });

  await writeFile(outputPath, ascii, "utf-8");

  return ascii;
};
