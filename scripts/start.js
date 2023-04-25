import { cleanAsync } from "./lib/clean.js";
import { copyAssetsAsync } from "./lib/copy-assets.js";
import { serveAsync } from "./lib/esbuild.js";

await cleanAsync();
await copyAssetsAsync(false, false);
await buildHtmlWithPreloads(src("index.html"), dst("index.html"), dst(), ...jsStaticDeps);
await serveAsync();
