import { cleanAsync } from "./lib/clean.js";
import { buildAsync } from "./lib/esbuild.js";
import { copyAssetsAsync } from "./lib/copy-assets.js";
import { buildHtmlWithPreloads } from "./lib/html-helper.js";
import { src, dst } from "./lib/path-helper.js";

const bundle = true;

await cleanAsync();

const { jsDeps } = await buildAsync(true, bundle);
const jsStaticDeps = jsDeps.reduce((aggr, [modulePath, kind]) => {
    if (kind === "static") {
        aggr.push(modulePath);
    }
    return aggr;
}, []);

await copyAssetsAsync();
await buildHtmlWithPreloads(src("index.html"), dst("index.html"), dst(), ...jsStaticDeps);
