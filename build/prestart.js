import { cleanAsync } from "./lib/clean.js";
import { copyAssetsAsync } from "./lib/copy-assets.js";

await cleanAsync();
await copyAssetsAsync();
