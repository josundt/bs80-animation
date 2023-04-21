import esbuild from "esbuild";
import { src, dst } from "./path-helper.js";
import http from "node:http";

/** @type {import("esbuild").BuildOptions} */
const baseOptions = {
    entryPoints: [
        src("index.ts"),
        src("index.css")
    ],
    // outfile: dst("index.js"),
    outdir: dst(),
    bundle: true,
    sourcemap: true,
    minify: false,
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

function getOptions(production = false) {
    return {
        ...baseOptions,
        ...{
            minify: production,
            define: {
                IS_DEVELOPMENT: String(!production)
            }
        }
    }
}

export function buildAsync(production = false) {

    const o = getOptions(production);

    console.info(` > Build [${o.entryPoints.join(", ")}] to "${dst()}"...`);
    console.info("");

    return esbuild.build(o);
}

export async function serveAsync(production = false, port = 8080) {

    const o = getOptions(production);

    console.info(` > Serve from "${dst()}"...`);
    console.info("");

    // Start esbuild's server on a random local port
    let ctx = await esbuild.context(o);

    await ctx.watch({

    });

    // The return value tells us where esbuild's local server is
    const { host: serveHost, port: servePort } = await ctx.serve({
        ...serveOptions,
        ...{
            port
        }
     });

    // Then start a proxy server on port 3000
    http.createServer((req, res) => {

        const options = {
            hostname: serveHost,
            port: servePort,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        // Forward each incoming request to esbuild
        const proxyReq = http.request(options, proxyRes => {

            // If esbuild returns "not found", send a custom 404 page
            if (proxyRes.statusCode === 404) {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>A custom 404 page</h1>");
                return;
            }

            // Otherwise, forward the response from esbuild to the client
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        // Forward the body of the request to esbuild
        req.pipe(proxyReq, { end: true });

    }).listen(3000);

}
