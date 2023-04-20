import { cleanAsync } from "./lib/clean.js";
import { esbuildAsync } from "./lib/esbuild.js";
import { copyAssetsAsync } from "./lib/copy-assets.js";

await cleanAsync();

await esbuildAsync(true);

await copyAssetsAsync();
