import path from "node:path";
import fsp from "node:fs/promises";
import { rimraf } from "rimraf";
import esbuild from "esbuild";

const s = "./src/"
const d = "./dst/";
const src = p => path.resolve(`${s}${p}`);
const dst = p => path.resolve(`${d}${p}`);

await rimraf(dst("**/*"), {
    glob: true
});

await esbuild.build({
    entryPoints: [src("index.ts")],
    outfile: dst("index.js"),
    bundle: true,
    sourcemap: true,
    tsconfig: "./tsconfig.esbuild.json"
});

await Promise.all([
    "index.html",
    "index.css",
    "images/bare_saa_80_logo_nobg.svg"
].map(
    f => fsp.copyFile(src(f), dst(f))
));
