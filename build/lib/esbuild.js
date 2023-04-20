import esbuild from "esbuild";
import { src, dst } from "./path-helper.js";

export function esbuildAsync(minify) {
    return esbuild.build({
        entryPoints: [src("index.ts")],
        outfile: dst("index.js"),
        bundle: true,
        sourcemap: true,
        minify: !!minify,
        logLevel: "info",
        color: true
    });
}
