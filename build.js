import path from "node:path";
import fsp from "node:fs/promises";
import { rimraf } from "rimraf";
import esbuild from "esbuild";

const srcDir = "./src/"
const dstDir = "./dist/";
const src = p => path.resolve(`${srcDir}${p}`);
const dst = p => path.resolve(`${dstDir}${p}`);

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
    async f => {
        const s = src(f);
        const d = dst(f);
        const dDir = path.dirname(d);
        try {
            await fsp.access(dDir);
        } catch {
            await fsp.mkdir(path.dirname(d));
        }
        await fsp.copyFile(src(f), dst(f));
    }
));
