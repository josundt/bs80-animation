import esbuild from "esbuild";
import { src, dst } from "./path-helper.js";
import http from "node:http";
import { glob } from "glob";
import { resolveRecursiveAsync } from "./resolver.js";

/** @type {import("esbuild").BuildOptions} */
const baseOptions = {
    outdir: dst(),
    // conditions: ["browser"],
    // entryNames: "[dir]/[name]",
    // outbase: src(),
    format: "esm",
    sourcemap: true,
    logLevel: "info",
    color: true,
    define: {
        IS_DEVELOPMENT: "true"
    }
};

/** @type {import("esbuild").ServeOptions} */
const serveOptions = {
    port: 8080,
    host: "127.0.0.1",
    servedir: dst()
};

/**
 * @param {boolean|} production
 * @param {boolean|} bundle
 * @returns {Promise<import("esbuild").BuildOptions>}
 */
async function getOptionsAsync(production, bundle) {

    const tsFiles = [src("index.ts")];
    if (!bundle) {
        const resolved = await resolveRecursiveAsync("./index.ts", src());

        // Try to resolve all modules recursive (PS! Does not exclude type only exports)
        tsFiles.push(...resolved.map(([m]) => m));

        // Alternative: Include all files in src folder
        //tsFiles = await glob("**/*.ts", { cwd: src()})).map(f => src(f);
    }

    return {
        ...baseOptions,
        ...{
            entryPoints: [
                ...tsFiles,
                src("index.css")
            ],
            bundle: bundle,
            minify: production,
            define: {
                IS_DEVELOPMENT: String(!production)
            }
        }
    }
}

/**
 * @param {boolean?} production
 * @param {boolean?} bundle
 * @returns {Promise<void>}
 */
export async function buildAsync(production = false, bundle = false) {

    const o = await getOptionsAsync(production, bundle);

    console.info(` > ${bundle ? "Bundling" : "Building"} "${src()}" to "${dst()}" [env: ${production ? "production" : "development"}]...`);
    console.info("");

    /*const result =*/ await esbuild.build(o);
}

/**
 * @param {boolean?} production
 * @param {boolean?} bundle
 * @param {number?} port
 * @returns {Promise<void>}
 */
export async function serveAsync(production = false, bundle = false, port = 8080) {

    const o = await getOptionsAsync(production, bundle);

    console.info(` > Serving from "${dst()}" [env: ${production ? "production" : "development"}; bundle: ${bundle}]...`);
    console.info("");

    // Start esbuild's server on a random local port
    let ctx = await esbuild.context(o);

    await ctx.watch({});

    // The return value tells us where esbuild's local server is
    const { host: serveHost, port: servePort } = await ctx.serve({
        ...serveOptions,
        ...{
            port
        }
     });

    // Then start a proxy server on the specified port
    http.createServer((req, res) => {

        /** @type {http.RequestOptions} */
        const options = {
            hostname: serveHost,
            port: servePort,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        // Forward each incoming request to esbuild
        const proxyReq = http.request(options, proxyRes => {

            // If esbuild returns "not found", send a custom 404 page
            if (proxyRes.statusCode === 404) {
                res.writeHead(404, {
                    "Content-Type": "text/html"
                });
                res.end(
                    "<h1>A custom 404 page</h1>"
                );
                return;
            }

            // Otherwise, forward the response from esbuild to the client
            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            proxyRes.pipe(res, {
                end: true
            });

        });

        // Forward the body of the request to esbuild
        req.pipe(proxyReq, { end: true });

    }).listen(3000);

}
