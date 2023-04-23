import esbuild from "esbuild";
import { src, dst } from "./path-helper.js";
import http from "node:http";
import { glob } from "glob";
import { resolveImportGraphAsync } from "./resolver.js";

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
 * @returns {Promise<[options: import("esbuild").BuildOptions, dependencies: Array<[dependency: string, dependent: string, kind: "static" | "dynamic"]>]>}
 */
async function getOptionsAndDependenciesAsync(production, bundle) {

    const tsDependencies = [[src("index.js"), "static"]];
    const tsEntryPoints = [src("index.ts")];
    if (!bundle) {
        tsDependencies.push(...(await resolveImportGraphAsync("./index.ts", src("index.html"))).map(([dep,,kind]) => [dep, kind]));

        // Try to resolve all modules recursive (PS! Does not exclude type only exports)
        tsEntryPoints.push(...tsDependencies.map(([m]) => m));

        // Alternative: Include all files in src folder
        //tsFiles = await glob("**/*.ts", { cwd: src()})).map(f => src(f);
    }

    return [
        {
            ...baseOptions,
            ...{
                entryPoints: [
                    ...tsEntryPoints,
                    src("index.css")
                ],
                bundle: bundle,
                format: bundle ? "iife" : "esm",
                minify: production,
                define: {
                    IS_DEVELOPMENT: String(!production)
                }
            }
        },
        tsDependencies
    ];
}

/**
 * @param {boolean?} production
 * @param {boolean?} bundle
 * @returns {Promise<{ jsDeps: Array<[dependency: string, kind: "static" | "dynamic"]> }>}
 */
export async function buildAsync(production = false, bundle = false) {

    const [options, tsDeps] = await getOptionsAndDependenciesAsync(production, bundle);
    const jsDeps = tsDeps.map(([modulePath, kind]) => [
        modulePath.replace(/\.ts$/, ".js").replace(src(), dst()),
        kind
    ]);

    console.info(` > ${bundle ? "Bundling" : "Building"} "${src()}" to "${dst()}" [env: ${production ? "production" : "development"}]...`);
    console.info("");

    await esbuild.build(options);
    return {
        jsDeps
    };
}

/**
 * @param {boolean?} production
 * @param {boolean?} bundle
 * @param {number?} port
 * @returns {Promise<void>}
 */
export async function serveAsync(production = false, bundle = false, port = 8080) {

    const [options] = await getOptionsAndDependenciesAsync(production, bundle);

    console.info(` > Serving from "${dst()}" [env: ${production ? "production" : "development"}; bundle: ${bundle}]...`);
    console.info("");

    // Start esbuild's server on a random local port
    let ctx = await esbuild.context(options);

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
