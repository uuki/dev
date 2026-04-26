import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertImageToAscii } from "../src/convert.js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { DEFAULT_ALPHABET, MAX_INPUT_BYTES } from "../src/types.js";
import { join } from "node:path";

const imageMock = vi.fn();
const fixtureDir = "./test-fixtures";
const inputPath = join(fixtureDir, "test-image.png");
const outputPath = "./test-output.txt";

vi.mock("ascii-art", () => ({
  default: {
    image: imageMock
  }
}));

describe("convertImageToAscii", () => {
  beforeEach(() => {
    imageMock.mockReset();
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(inputPath, "fake image");
    try {
      unlinkSync(outputPath);
    } catch {}
  });

  it("should generate ascii and write file", async () => {
    const expectedAscii = "mock ascii";

    imageMock.mockResolvedValue(expectedAscii);

    const ascii = await convertImageToAscii({
      inputPath,
      outputPath,
      width: 40
    });

    expect(typeof ascii).toBe("string");
    expect(ascii).toBe(expectedAscii);
    expect(existsSync(outputPath)).toBe(true);
    expect(readFileSync(outputPath, "utf-8")).toBe(expectedAscii);
    expect(imageMock).toHaveBeenCalledWith(
      {
        filepath: expect.stringMatching(/test-image\.png$/),
        width: 40,
        alphabet: DEFAULT_ALPHABET
      }
    );
  });

  it("should reject remote URLs", async () => {
    await expect(
      convertImageToAscii({
        inputPath: "https://example.com/test.png",
        outputPath
      })
    ).rejects.toThrow("remote URLs are not allowed");
  });

  it("should reject files that are too large", async () => {
    imageMock.mockResolvedValue("unused");
    const hugePath = join(fixtureDir, "huge.png");
    writeFileSync(hugePath, Buffer.alloc(MAX_INPUT_BYTES + 1));

    await expect(
      convertImageToAscii({
        inputPath: hugePath,
        outputPath
      })
    ).rejects.toThrow("input file is too large");
  });

  it("should reject non-txt outputs", async () => {
    await expect(
      convertImageToAscii({
        inputPath,
        outputPath: "./output.md"
      })
    ).rejects.toThrow("outputPath must end with .txt");
  });
});
