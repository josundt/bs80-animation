import { cleanAsync } from "./lib/clean.js";
import { buildAsync } from "./lib/esbuild.js";
import { copyAssetsAsync } from "./lib/copy-assets.js";

await cleanAsync();
await copyAssetsAsync();
await buildAsync(true, true);
