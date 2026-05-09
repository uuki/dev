import http from "http";
import fs from "fs";
import path from "path";
import { parseArgs } from "util";

const { values: args } = parseArgs({
  options: {
    port:  { type: "string", default: "3000" },
    m:     { type: "string", default: "7" },
    amp:   { type: "string", default: "3" },
    speed: { type: "string", default: "1" },
    r:     { type: "string", default: "22" },
    rw:    { type: "string", default: "420" },
    rh:    { type: "string", default: "220" },
    cr:    { type: "string", default: "150" },
    shape: { type: "string", default: "rect" },
    dur:   { type: "string", default: "2" },
    hn:    { type: "string", default: "1" },
    hd:    { type: "string", default: "1.5" },
    hs:    { type: "string", default: "7" },
    dp:    { type: "string", default: "0" },
    bw:    { type: "string", default: "0" },
    fr:    { type: "string", default: "4" },
  },
});

const PORT = parseInt(args.port!);
const INIT = {
  m:     args.m!,
  amp:   args.amp!,
  speed: args.speed!,
  r:     args.r!,
  rw:    args.rw!,
  rh:    args.rh!,
  cr:    args.cr!,
  shape: args.shape!,
  dur:   args.dur!,
  hn:    args.hn!,
  hd:    args.hd!,
  hs:    args.hs!,
  dp:    args.dp!,
  bw:    args.bw!,
  fr:    args.fr!,
};
const HTML = path.join(import.meta.dirname, "index.html");

const server = http.createServer((req, res) => {
  fs.readFile(HTML, "utf-8", (err, data) => {
    if (err) { res.writeHead(500); res.end("index.html not found"); return; }
    const injected = data.replace("__INIT_PARAMS__", JSON.stringify(INIT));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(injected);
  });
});

server.listen(PORT, () => {
  console.log(`wave-morph running → http://localhost:${PORT}`);
  console.log(`  m=${INIT.m}  amp=${INIT.amp}  speed=${INIT.speed}  dur=${INIT.dur}`);
  console.log(`  shape=${INIT.shape}  rw=${INIT.rw}  rh=${INIT.rh}  r=${INIT.r}  cr=${INIT.cr}`);
  console.log(`  hn=${INIT.hn}  hd=${INIT.hd}  hs=${INIT.hs}  dp=${INIT.dp}  bw=${INIT.bw}`);
});
