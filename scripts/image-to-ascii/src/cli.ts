#!/usr/bin/env node

import { Command } from "commander";
import { convertImageToAscii } from "./convert.js";
import { DEFAULT_ALPHABET, MAX_WIDTH } from "./types.js";

const program = new Command();

program
  .name("img2ascii")
  .description("Convert image to ASCII art")
  .argument("[from]", "input image path")
  .argument("[to]", "output file path")
  .option("-i, --input <path>", "input image path")
  .option("-o, --output <path>", "output file path")
  .option("-w, --width <number>", "ascii width", "80")
  .option("-a, --alphabet <string>", "ascii alphabet", DEFAULT_ALPHABET)
  .action(async (from, to, opts) => {
    try {
      const inputPath = opts.input ?? from;
      const outputPath = opts.output ?? to;
      const width = Number(opts.width);

      if (!inputPath || !outputPath) {
        throw new Error("input and output paths are required");
      }

      if (!Number.isInteger(width) || width < 1 || width > MAX_WIDTH) {
        throw new Error(`width must be an integer between 1 and ${MAX_WIDTH}`);
      }

      const ascii = await convertImageToAscii({
        inputPath,
        outputPath,
        width,
        alphabet: opts.alphabet
      });

      console.log("✔ converted");
      console.log(ascii);
    } catch (err) {
      console.error("✖ error:", err);
      process.exit(1);
    }
  });

program.parse();
